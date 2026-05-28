const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Ask the LLM a question with provided context
 * @param {string} question - User's question
 * @param {string} context - Retrieved context from vector store
 * @param {boolean} stream - Whether to stream the response
 * @returns {Promise<string|Stream>} LLM response or stream
 */
async function askLLM(question, context, stream = false) {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are a helpful and intelligent document assistant. When answering questions:

1. Always respond in clear, structured format using bullet points or short paragraphs
2. Be specific — reference actual names, dates, and details found in the document
3. If the document is a resume or profile, organize your answer as: who the person is, what they do, their key skills, and notable achievements
4. Keep answers concise but complete — no fluff or filler sentences
5. Never say 'based on the provided context' or 'according to the document' — just answer directly
6. If asked a general question like 'what is this about', give a 3-5 sentence summary with the most important highlights

Answer using ONLY the information in the provided context. If the answer is not in the context, say 'I don't see that information in this document.'`
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`
      }
    ];

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',  // Updated to current model
      messages: messages,
      max_tokens: 1024,
      temperature: 0.1, // Low temperature for factual responses
      stream: stream
    });

    if (stream) {
      return response; // Return the stream object
    }

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error calling LLM:', error);
    throw new Error('Failed to get LLM response: ' + error.message);
  }
}

/**
 * Generate a streaming response from the LLM
 * @param {string} question - User's question
 * @param {string} context - Retrieved context
 * @returns {Promise<Stream>} Streaming response
 */
async function askLLMStream(question, context) {
  return await askLLM(question, context, true);
}

module.exports = { askLLM, askLLMStream };
