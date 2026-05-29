const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const { PDFParse } = require('pdf-parse');
const upload = require('../middleware/upload');
const { chunkText } = require('../services/chunker');
const { generateEmbeddings } = require('../services/embedder');
const { storeChunks } = require('../services/vectorStore');

/**
 * POST /upload
 * Upload and process a PDF file
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Processing file: ${req.file.originalname}`);

    // Step 1: Read the PDF file
    const dataBuffer = await fs.readFile(req.file.path);

    // Step 2: Extract text from PDF using pdf-parse
    const uint8Array = new Uint8Array(dataBuffer);
    const parser = new PDFParse({ data: uint8Array });
    await parser.load();
    
    const info = await parser.getInfo();
    const numPages = info.numPages || info.total || 1;
    
    const textResult = await parser.getText();
    let text = '';
    
    if (textResult && textResult.text) {
      text = textResult.text;
    } else if (textResult && textResult.pages && Array.isArray(textResult.pages)) {
      text = textResult.pages.map(p => p.text || '').join('\n\n');
    } else if (typeof textResult === 'string') {
      text = textResult;
    }

    // Remove common PDF footer noise like "-- 1 of 1 --"
    const cleanedText = text
      .split('\n')
      .filter((line) => !/^--\s*\d+\s+of\s+\d+\s*--\s*$/.test(line.trim()))
      .join('\n')
      .trim();

    // Heuristic: scanned/image-only PDFs often extract almost no meaningful text
    const alphaChars = (cleanedText.match(/[A-Za-z]/g) || []).length;
    const seemsScannedOrUnreadable = cleanedText.length < 80 || alphaChars < 40;

    if (!cleanedText || cleanedText.length === 0 || seemsScannedOrUnreadable) {
      // Clean up uploaded file
      await parser.destroy();
      await fs.unlink(req.file.path);
      return res.status(400).json({
        error: 'PDF text extraction failed',
        message: 'The PDF appears to be scanned/image-based or unreadable. Please upload a text-based PDF or use OCR first.'
      });
    }

    console.log(`Extracted ${cleanedText.length} characters from PDF (${numPages} pages)`);

    // Step 4: Chunk the text
    const metadata = {
      filename: req.file.originalname,
      uploadDate: new Date().toISOString(),
      pages: numPages
    };
    const chunks = await chunkText(cleanedText, metadata);

    // Check if using Pinecone (Inference API) or ChromaDB (needs embeddings)
    const VECTOR_STORE = process.env.VECTOR_STORE || 'chroma';
    
    if (VECTOR_STORE === 'pinecone') {
      // Step 5 & 6: Store chunks directly - Pinecone Inference API generates embeddings
      await storeChunks(chunks, null, req.file.originalname);
    } else {
      // Step 5: Generate embeddings for each chunk (ChromaDB)
      const chunkTexts = chunks.map(c => c.pageContent);
      const embeddings = await generateEmbeddings(chunkTexts);
      // Step 6: Store chunks and embeddings in vector database
      await storeChunks(chunks, embeddings, req.file.originalname);
    }

    // Clean up uploaded file and destroy parser
    await parser.destroy();
    await fs.unlink(req.file.path);

    res.json({
      success: true,
      message: 'File processed successfully',
      filename: req.file.originalname,
      chunks: chunks.length,
      pages: numPages
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      error: 'Failed to process file',
      message: error.message
    });
  }
});

module.exports = router;