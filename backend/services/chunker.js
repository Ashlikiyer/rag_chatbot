const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');

/**
 * Chunk text into smaller pieces for embedding
 * @param {string} text - The text to chunk
 * @param {object} metadata - Metadata to attach to each chunk
 * @returns {Promise<Array>} Array of document chunks with metadata
 */
async function chunkText(text, metadata = {}) {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
      separators: ['\n\n', '\n', ' ', '']
    });

    const chunks = await splitter.createDocuments([text], [metadata]);
    
    console.log(`Created ${chunks.length} chunks from text`);
    return chunks;
  } catch (error) {
    console.error('Error chunking text:', error);
    throw new Error('Failed to chunk text: ' + error.message);
  }
}

module.exports = { chunkText };
