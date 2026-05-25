const express = require('express');
const router = express.Router();
const { getCollectionCount } = require('../services/vectorStore');

/**
 * GET /status
 * Returns the current status of the backend and document count
 */
router.get('/', async (req, res) => {
  try {
    const documentCount = await getCollectionCount();
    
    res.json({
      success: true,
      status: 'online',
      documentCount: documentCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.json({
      success: true,
      status: 'online',
      documentCount: 0,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
