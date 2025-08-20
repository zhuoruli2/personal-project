const memoryStorage = require('../storage/memoryStorage');

// Get all sources
const getSources = async (req, res) => {
  try {
    const sources = memoryStorage.getSources();

    res.json({
      success: true,
      data: sources
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sources',
      error: error.message
    });
  }
};

// Get source by ID
const getSourceById = async (req, res) => {
  try {
    const source = memoryStorage.getSourceById(req.params.id);

    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'Source not found'
      });
    }

    // Get article count for this source
    const articles = memoryStorage.getArticles({ source: source.id });
    const articleCount = articles.pagination.total;

    res.json({
      success: true,
      data: {
        ...source,
        articleCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching source',
      error: error.message
    });
  }
};

// Get articles from specific source
const getSourceArticles = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Check if source exists
    const source = memoryStorage.getSourceById(id);
    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'Source not found'
      });
    }

    const result = memoryStorage.getArticles({
      page,
      limit,
      source: id
    });

    res.json({
      success: true,
      data: {
        source: {
          id: source.id,
          name: source.name,
          displayName: source.displayName,
          logoUrl: source.logoUrl
        },
        articles: result.articles,
        pagination: result.pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching source articles',
      error: error.message
    });
  }
};

module.exports = {
  getSources,
  getSourceById,
  getSourceArticles
};