require('dotenv').config();

const COLLECTION_NAME = 'rag_documents';

/**
 * In-memory vector store fallback (no external ChromaDB server required)
 * This keeps development simple and avoids connection timeouts.
 *
 * Note:
 * - Data is lost when backend restarts
 * - For production, switch to Pinecone or a running ChromaDB server
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
 * Store document chunks with their embeddings
 * @param {Array} chunks - Array of document chunks
 * @param {Array<Array<number>>} embeddings - Array of embedding vectors
 * @param {string} filename - Name of the source file
 * @returns {Promise<void>}
 */
async function storeChunks(chunks, embeddings, filename) {
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
 * Query for similar chunks by cosine similarity
 * @param {Array<number>} queryEmbedding - Query embedding vector
 * @param {number} topK - Number of results to return
 * @param {string} filename - Optional filename to filter results
 * @returns {Promise<Object>} Query results with documents and metadata
 */
async function queryChunks(queryEmbedding, topK = 5, filename = null) {
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
      // Keep "distance-like" value where lower is better
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
 * Get count of chunks in the store
 * @returns {Promise<number>}
 */
async function getDocumentCount() {
  try {
    return memoryStore[COLLECTION_NAME].length;
  } catch (error) {
    console.error('Error getting document count:', error);
    return 0;
  }
}

/**
 * Clear all chunks from the store
 * @returns {Promise<void>}
 */
async function clearCollection() {
  try {
    memoryStore[COLLECTION_NAME] = [];
    console.log('Collection cleared successfully (memory store)');
  } catch (error) {
    console.error('Error clearing collection:', error);
    throw new Error('Failed to clear collection: ' + error.message);
  }
}

/**
 * Alias for getDocumentCount
 * @returns {Promise<number>}
 */
async function getCollectionCount() {
  return await getDocumentCount();
}

module.exports = {
  storeChunks,
  queryChunks,
  getDocumentCount,
  getCollectionCount,
  clearCollection
};