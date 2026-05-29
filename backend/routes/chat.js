const express = require('express');
const router = express.Router();
const { generateEmbedding } = require('../services/embedder');
const { queryChunks } = require('../services/vectorStore');
const { askLLM, askLLMStream } = require('../services/llm');

/**
 * POST /chat
 * Process a chat question and return an answer based on stored documents
 */
router.post('/', async (req, res) => {
  try {
    const { question, sessionId, stream = false, filename = null } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log(`[CHAT] Request body:`, JSON.stringify({ question: question.substring(0, 50), filename, sessionId }));
    console.log(`Processing question: ${question}${filename ? ` (filtered to: ${filename})` : ''}`);

    // Check if using Pinecone (Inference API) or ChromaDB (needs embeddings)
    const VECTOR_STORE = process.env.VECTOR_STORE || 'chroma';
    
    let results;
    if (VECTOR_STORE === 'pinecone') {
      // Step 1 & 2: Query Pinecone with text directly (Inference API generates embedding)
      results = await queryChunks(question, 5, filename);
    } else {
      // Step 1: Generate embedding for the question (ChromaDB)
      const questionEmbedding = await generateEmbedding(question);
      // Step 2: Query vector database for similar chunks
      results = await queryChunks(questionEmbedding, 5, filename);
    }

    // Hard safety filter in route (prevents cross-document leakage even if store filter fails)
    let filteredDocuments = results.documents || [];
    let filteredMetadatas = results.metadatas || [];
    let filteredDistances = results.distances || [];

    if (filename) {
      const kept = [];
      for (let i = 0; i < filteredMetadatas.length; i++) {
        if (filteredMetadatas[i]?.filename === filename) kept.push(i);
      }

      filteredDocuments = kept.map((i) => filteredDocuments[i]);
      filteredMetadatas = kept.map((i) => filteredMetadatas[i]);
      filteredDistances = kept.map((i) => filteredDistances[i]);

      console.log(`[CHAT] Applied route-level filename filter "${filename}", kept ${filteredDocuments.length} chunks`);
    }

    if (filteredDocuments.length === 0) {
      const message = filename 
        ? `No content found in "${filename}". The file may be empty, scanned/image-based, or not yet uploaded.`
        : "I don't have any documents to reference. Please upload a PDF document first.";
      
      return res.json({
        answer: message,
        sources: [],
        debug: {
          requestedFilename: filename || null,
          returnedChunks: 0
        }
      });
    }

    // Step 3: Build context from retrieved chunks
    const context = filteredDocuments.join('\n\n---\n\n');

    // Step 4: Get answer from LLM
    if (stream) {
      // Set headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const streamResponse = await askLLMStream(question, context);

      // Stream the response
      for await (const chunk of streamResponse) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Send sources at the end
      res.write(`data: ${JSON.stringify({ 
        done: true, 
        sources: results.metadatas 
      })}\n\n`);
      res.end();

    } else {
      // Non-streaming response
      const answer = await askLLM(question, context);

      res.json({
        answer: answer,
        sources: filteredDocuments.map((doc, idx) => ({
          text: doc,
          metadata: {
            filename: filteredMetadatas[idx].filename,
            chunkIndex: filteredMetadatas[idx].chunkIndex,
            distance: filteredDistances[idx]
          }
        })),
        debug: {
          requestedFilename: filename || null,
          returnedChunks: filteredDocuments.length
        }
      });
    }

  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({
      error: 'Failed to process question',
      message: error.message
    });
  }
});

/**
 * GET /chat/status
 * Get status of the vector database
 */
router.get('/status', async (req, res) => {
  try {
    const { getDocumentCount } = require('../services/vectorStore');
    const count = await getDocumentCount();
    
    res.json({
      status: 'ready',
      documentCount: count,
      message: count > 0 
        ? `${count} document chunks available` 
        : 'No documents uploaded yet'
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({
      error: 'Failed to get status',
      message: error.message
    });
  }
});

/**
 * DELETE /chat/clear
 * Clear documents from vector store for a specific filename
 */
router.delete('/clear', async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    console.log(`[CHAT] Clearing documents for filename: ${filename}`);

    const { clearDocumentsByFilename } = require('../services/vectorStore');
    await clearDocumentsByFilename(filename);

    res.json({
      success: true,
      message: `Cleared all chunks for ${filename}`
    });

  } catch (error) {
    console.error('Error clearing documents:', error);
    res.status(500).json({
      error: 'Failed to clear documents',
      message: error.message
    });
  }
});

module.exports = router;
