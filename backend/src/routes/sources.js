const express = require('express');
const router = express.Router();
const {
  getSources,
  getSourceById,
  getSourceArticles
} = require('../controllers/sourceController');

// Public routes
// GET /api/sources
router.get('/', getSources);

// GET /api/sources/60f1b2a3c4a5b6c7d8e9f0a1
router.get('/:id', getSourceById);

// GET /api/sources/60f1b2a3c4a5b6c7d8e9f0a1/articles?page=1&limit=20
router.get('/:id/articles', getSourceArticles);

module.exports = router;