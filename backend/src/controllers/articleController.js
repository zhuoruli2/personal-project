const memoryStorage = require('../storage/memoryStorage');

// Get all articles with pagination and filtering
const getArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const source = req.query.source;
    
    const result = memoryStorage.getArticles({
      page,
      limit,
      category,
      source
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching articles',
      error: error.message
    });
  }
};

// Get single article by ID
const getArticleById = async (req, res) => {
  try {
    const article = memoryStorage.getArticleById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching article',
      error: error.message
    });
  }
};

// Search articles
const searchArticles = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const result = memoryStorage.getArticles({
      page: parseInt(page),
      limit: parseInt(limit),
      search: q
    });
    
    res.json({
      success: true,
      data: {
        ...result,
        query: q
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching articles',
      error: error.message
    });
  }
};

// Get articles by category
const getArticlesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = memoryStorage.getArticles({
      page,
      limit,
      category
    });
    
    res.json({
      success: true,
      data: {
        ...result,
        category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching articles by category',
      error: error.message
    });
  }
};

// Get latest articles (for homepage)
const getLatestArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const result = memoryStorage.getArticles({
      page: 1,
      limit
    });
    
    res.json({
      success: true,
      data: result.articles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching latest articles',
      error: error.message
    });
  }
};

// Get app statistics
const getStats = async (req, res) => {
  try {
    const stats = memoryStorage.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

module.exports = {
  getArticles,
  getArticleById,
  searchArticles,
  getArticlesByCategory,
  getLatestArticles,
  getStats
};