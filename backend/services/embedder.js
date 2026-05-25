const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generate embeddings for text using Groq API
 * Note: As of now, Groq doesn't have a dedicated embeddings endpoint.
 * We'll use a simple approach with text encoding for now.
 * In production, you might want to use Hugging Face or OpenAI embeddings.
 * 
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} Embedding vector
 */
async function generateEmbedding(text) {
  try {
    // For now, we'll use a simple hash-based approach
    // In production, replace this with actual embedding API calls
    // (Hugging Face sentence-transformers or OpenAI embeddings)
    
    // Simple text-to-vector conversion (placeholder)
    // This creates a consistent 384-dimensional vector based on text
    const vector = await simpleTextToVector(text);
    return vector;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding: ' + error.message);
  }
}

/**
 * Generate embeddings for multiple texts
 * @param {Array<string>} texts - Array of texts to embed
 * @returns {Promise<Array<Array<number>>>} Array of embedding vectors
 */
async function generateEmbeddings(texts) {
  try {
    const embeddings = await Promise.all(
      texts.map(text => generateEmbedding(text))
    );
    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings: ' + error.message);
  }
}

/**
 * Simple text to vector conversion (placeholder for actual embedding model)
 * Creates a consistent 384-dimensional vector
 * @param {string} text - Text to convert
 * @returns {Promise<Array<number>>} Vector representation
 */
async function simpleTextToVector(text) {
  const dimension = 384; // Standard dimension for sentence transformers
  const vector = new Array(dimension).fill(0);
  
  // Create a simple hash-based vector
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const index = (charCode * (i + 1)) % dimension;
    vector[index] += charCode / 1000;
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => magnitude > 0 ? val / magnitude : 0);
}

module.exports = { generateEmbedding, generateEmbeddings };
