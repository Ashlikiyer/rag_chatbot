require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

const COLLECTION_NAME = 'rag_documents';
const VECTOR_STORE = process.env.VECTOR_STORE || 'chroma';

// Pinecone client (lazy initialization)
let pineconeClient = null;
let pineconeIndex = null;

/**
 * Initialize Pinecone client
 */
async function initPinecone() {
  if (pineconeClient) return pineconeIndex;

  try {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });

    pineconeIndex = pineconeClient.index(process.env.PINECONE_INDEX);
    console.log('Pinecone initialized successfully');
    return pineconeIndex;
  } catch (error) {
    console.error('Error initializing Pinecone:', error);
    throw new Error('Failed to initialize Pinecone: ' + error.message);
  }
}

/**
 * In-memory vector store fallback (ChromaDB alternative)
 * This keeps development simple and avoids connection timeouts.
 *
 * Note:
 * - Data is lost when backend restarts
 * - For production, switch to Pinecone
 */
const memoryStore = {
  [COLLECTION_NAME]: []
};

/**
 * Compute cosine similarity between two vectors
 * @param {Array<number>} a
 * @param {Array<number>} b
 * @returns {number}
 */
function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    return 0;
  }

  const length = Math.min(a.length, b.length);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < length; i++) {
    const va = Number(a[i]) || 0;
    const vb = Number(b[i]) || 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (!denom) return 0;

  return dot / denom;
}

/**
 * Store document chunks with their embeddings (ChromaDB/Memory)
 */
async function storeChunksChroma(chunks, embeddings, filename) {
  try {
    if (!Array.isArray(chunks) || !Array.isArray(embeddings) || chunks.length !== embeddings.length) {
      throw new Error('Invalid chunks/embeddings payload');
    }

    // Remove existing chunks for this filename to avoid duplicates
    memoryStore[COLLECTION_NAME] = memoryStore[COLLECTION_NAME].filter(
      item => item.metadata.filename !== filename
    );
    console.log(`Cleared existing chunks for: ${filename}`);

    const timestamp = Date.now();

    const records = chunks.map((chunk, i) => {
      const cleanMetadata = {
        filename: filename,
        chunkIndex: i,
        timestamp: timestamp
      };

      if (chunk.metadata) {
        Object.keys(chunk.metadata).forEach((key) => {
          const value = chunk.metadata[key];
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
            cleanMetadata[key] = value;
          } else if (typeof value === 'object') {
            cleanMetadata[key] = JSON.stringify(value);
          }
        });
      }

      return {
        id: `${filename}_chunk_${timestamp}_${i}`,
        document: chunk.pageContent,
        embedding: embeddings[i],
        metadata: cleanMetadata
      };
    });

    memoryStore[COLLECTION_NAME].push(...records);

    console.log(`Stored ${records.length} chunks for file: ${filename} (memory store)`);
  } catch (error) {
    console.error('Error storing chunks:', error);
    throw new Error('Failed to store chunks: ' + error.message);
  }
}

/**
 * Store document chunks with their embeddings (Pinecone with Inference API)
 * Note: With multilingual-e5-large, Pinecone generates embeddings automatically
 */
async function storeChunksPinecone(chunks, embeddings, filename) {
  try {
    if (!Array.isArray(chunks)) {
      throw new Error('Invalid chunks payload');
    }

    const index = await initPinecone();

    // First, delete existing vectors for this filename
    await clearDocumentsByFilenamePinecone(filename);

    const timestamp = Date.now();

    console.log(`Preparing ${chunks.length} chunks for Pinecone with Inference API`);

    // Prepare records for Pinecone Inference API
    // Use flat structure with _id and field names
    // Note: 'text' is the required field name for multilingual-e5-large
    const records = chunks.map((chunk, i) => {
      return {
        _id: `${filename}_chunk_${timestamp}_${i}`,
        text: chunk.pageContent, // Required field name for Inference API
        filename: filename,
        chunkIndex: i,
        timestamp: timestamp
      };
    });

    console.log(`Records to upsert: ${records.length}`);
    console.log(`Sample record:`, JSON.stringify(records[0], null, 2));

    if (records.length === 0) {
      throw new Error('No records to upsert');
    }

    // Upsert records using Inference API
    // The SDK expects an options object with a records array
    await index.upsertRecords({ records });
    console.log(`Upserted ${records.length} records to Pinecone`);

    console.log(`Stored ${records.length} chunks for file: ${filename} (Pinecone Inference API)`);
  } catch (error) {
    console.error('Error storing chunks in Pinecone:', error);
    throw new Error('Failed to store chunks in Pinecone: ' + error.message);
  }
}

/**
 * Store document chunks with their embeddings
 * Routes to appropriate vector store based on VECTOR_STORE env variable
 */
async function storeChunks(chunks, embeddings, filename) {
  if (VECTOR_STORE === 'pinecone') {
    return await storeChunksPinecone(chunks, embeddings, filename);
  } else {
    return await storeChunksChroma(chunks, embeddings, filename);
  }
}

/**
 * Query for similar chunks (ChromaDB/Memory)
 */
async function queryChunksChroma(queryEmbedding, topK = 5, filename = null) {
  try {
    let all = memoryStore[COLLECTION_NAME];

    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0 || all.length === 0) {
      return { documents: [], metadatas: [], distances: [] };
    }

    // Filter by filename if provided
    if (filename) {
      all = all.filter(item => item.metadata.filename === filename);
      console.log(`Filtered to ${all.length} chunks for file: ${filename}`);
    }

    if (all.length === 0) {
      return { documents: [], metadatas: [], distances: [] };
    }

    const scored = all.map((item) => {
      const similarity = cosineSimilarity(queryEmbedding, item.embedding);
      const distance = 1 - similarity;
      return { ...item, similarity, distance };
    });

    scored.sort((a, b) => a.distance - b.distance);

    const top = scored.slice(0, topK);

    const formattedResults = {
      documents: top.map((t) => t.document),
      metadatas: top.map((t) => t.metadata),
      distances: top.map((t) => t.distance)
    };

    console.log(`Found ${formattedResults.documents.length} similar chunks (memory store)`);
    return formattedResults;
  } catch (error) {
    console.error('Error querying chunks:', error);
    throw new Error('Failed to query chunks: ' + error.message);
  }
}

/**
 * Query for similar chunks (Pinecone with Inference API)
 * Note: With multilingual-e5-large, we send text and Pinecone handles embedding
 */
async function queryChunksPinecone(queryText, topK = 5, filename = null) {
  try {
    // For Inference API, queryText should be a string, not an embedding array
    if (typeof queryText !== 'string' || !queryText.trim()) {
      return { documents: [], metadatas: [], distances: [] };
    }

    const index = await initPinecone();

    // Build query options for Inference API (camelCase)
    const queryOptions = {
      topK: topK,
      includeMetadata: true
    };

    // Add filename filter if provided
    if (filename) {
      queryOptions.filter = { filename: { $eq: filename } };
      console.log(`Querying Pinecone with filename filter: ${filename}`);
    }

    console.log(`Querying Pinecone with text: "${queryText.substring(0, 50)}..."`);

    // Query with text - Pinecone Inference API generates embedding automatically
    // Note: Pinecone Inference API filters don't work reliably with searchRecords
    // So we query more results and filter in the route layer
    const queryResponse = await index.searchRecords({
      query: {
        inputs: { text: queryText },
        topK: filename ? topK * 3 : topK  // Query more if filtering by filename
      },
      fields: ['text', 'filename', 'chunkIndex', 'timestamp']
    });

    if (!queryResponse.result || !queryResponse.result.hits || queryResponse.result.hits.length === 0) {
      console.log('No matches found in Pinecone');
      return { documents: [], metadatas: [], distances: [] };
    }

    const hits = queryResponse.result.hits;
    
    // Debug: log the first hit structure
    if (hits.length > 0) {
      console.log('[DEBUG] First hit structure:', JSON.stringify(hits[0], null, 2));
    }
    
    const formattedResults = {
      documents: hits.map(hit => hit.fields?.text || ''),
      metadatas: hits.map(hit => ({
        filename: hit.fields?.filename || '',
        chunkIndex: hit.fields?.chunkIndex || 0,
        timestamp: hit.fields?.timestamp || 0
      })),
      distances: hits.map(hit => 1 - (hit._score || 0))
    };

    console.log(`Found ${formattedResults.documents.length} similar chunks (Pinecone Inference API)`);
    console.log('[DEBUG] First metadata:', JSON.stringify(formattedResults.metadatas[0], null, 2));
    return formattedResults;
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw new Error('Failed to query Pinecone: ' + error.message);
  }
}

/**
 * Query for similar chunks
 * Routes to appropriate vector store based on VECTOR_STORE env variable
 */
async function queryChunks(queryEmbedding, topK = 5, filename = null) {
  if (VECTOR_STORE === 'pinecone') {
    return await queryChunksPinecone(queryEmbedding, topK, filename);
  } else {
    return await queryChunksChroma(queryEmbedding, topK, filename);
  }
}

/**
 * Get count of chunks in the store
 */
async function getDocumentCount() {
  try {
    if (VECTOR_STORE === 'pinecone') {
      const index = await initPinecone();
      const stats = await index.describeIndexStats();
      return stats.totalRecordCount || 0;
    } else {
      return memoryStore[COLLECTION_NAME].length;
    }
  } catch (error) {
    console.error('Error getting document count:', error);
    return 0;
  }
}

/**
 * Clear all chunks from the store
 */
async function clearCollection() {
  try {
    if (VECTOR_STORE === 'pinecone') {
      const index = await initPinecone();
      await index.deleteAll();
      console.log('Collection cleared successfully (Pinecone)');
    } else {
      memoryStore[COLLECTION_NAME] = [];
      console.log('Collection cleared successfully (memory store)');
    }
  } catch (error) {
    console.error('Error clearing collection:', error);
    throw new Error('Failed to clear collection: ' + error.message);
  }
}

/**
 * Alias for getDocumentCount
 */
async function getCollectionCount() {
  return await getDocumentCount();
}

/**
 * Clear all chunks for a specific filename (ChromaDB/Memory)
 */
async function clearDocumentsByFilenameChroma(filename) {
  try {
    const beforeCount = memoryStore[COLLECTION_NAME].length;
    memoryStore[COLLECTION_NAME] = memoryStore[COLLECTION_NAME].filter(
      item => item.metadata.filename !== filename
    );
    const afterCount = memoryStore[COLLECTION_NAME].length;
    const removed = beforeCount - afterCount;
    console.log(`Cleared ${removed} chunks for file: ${filename} (memory store)`);
  } catch (error) {
    console.error('Error clearing documents by filename:', error);
    throw new Error('Failed to clear documents: ' + error.message);
  }
}

/**
 * Clear all chunks for a specific filename (Pinecone)
 */
async function clearDocumentsByFilenamePinecone(filename) {
  try {
    const index = await initPinecone();
    
    // Delete all vectors with matching filename
    // Note: deleteMany may return 404 if no vectors exist, which is fine
    try {
      await index.deleteMany({
        filter: { filename: { $eq: filename } }
      });
      console.log(`Cleared chunks for file: ${filename} (Pinecone)`);
    } catch (deleteError) {
      // 404 means no vectors to delete, which is fine for first upload
      if (deleteError.message && deleteError.message.includes('404')) {
        console.log(`No existing chunks to clear for: ${filename} (Pinecone)`);
      } else {
        throw deleteError;
      }
    }
  } catch (error) {
    console.error('Error clearing documents by filename in Pinecone:', error);
    throw new Error('Failed to clear documents: ' + error.message);
  }
}

/**
 * Clear all chunks for a specific filename
 * Routes to appropriate vector store based on VECTOR_STORE env variable
 */
async function clearDocumentsByFilename(filename) {
  if (VECTOR_STORE === 'pinecone') {
    return await clearDocumentsByFilenamePinecone(filename);
  } else {
    return await clearDocumentsByFilenameChroma(filename);
  }
}

module.exports = {
  storeChunks,
  queryChunks,
  getDocumentCount,
  getCollectionCount,
  clearCollection,
  clearDocumentsByFilename
};