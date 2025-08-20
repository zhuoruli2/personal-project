const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleById,
  searchArticles,
  getArticlesByCategory,
  getLatestArticles,
  getStats
} = require('../controllers/articleController');

// Get all articles with pagination and filtering
// GET /api/articles?page=1&limit=20&category=news&source=sourceId&fromDate=2023-01-01&toDate=2023-12-31
router.get('/', getArticles);

// Get latest articles (for homepage)
// GET /api/articles/latest?limit=10
router.get('/latest', getLatestArticles);

// Search articles
// GET /api/articles/search?q=tesla&page=1&limit=20
router.get('/search', searchArticles);

// Get app statistics
// GET /api/articles/stats
router.get('/stats', getStats);

// Manual refresh endpoint for testing
// POST /api/articles/refresh
router.post('/refresh', async (req, res) => {
  try {
    const scrapeService = require('../utils/scrapeService');
    await scrapeService.forceRefresh();
    
    res.json({
      success: true,
      message: 'Manual refresh completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during manual refresh',
      error: error.message
    });
  }
});

// Get articles by category
// GET /api/articles/category/electric?page=1&limit=20
router.get('/category/:category', getArticlesByCategory);

// Get single article by ID (must be last)
// GET /api/articles/123
router.get('/:id', getArticleById);

module.exports = router;