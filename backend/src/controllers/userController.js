const User = require('../models/User');
const Article = require('../models/Article');

// Get user bookmarks
const getBookmarks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.userId)
      .populate({
        path: 'bookmarks.article',
        populate: {
          path: 'source',
          select: 'name displayName logoUrl'
        },
        options: {
          sort: { 'bookmarks.bookmarkedAt': -1 },
          skip: skip,
          limit: limit
        }
      })
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter out any null articles (in case articles were deleted)
    const validBookmarks = user.bookmarks.filter(bookmark => bookmark.article);
    
    const total = validBookmarks.length;

    res.json({
      success: true,
      data: {
        bookmarks: validBookmarks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookmarks',
      error: error.message
    });
  }
};

// Add bookmark
const addBookmark = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.userId;

    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if already bookmarked
    const user = await User.findById(userId);
    const existingBookmark = user.bookmarks.find(
      bookmark => bookmark.article.toString() === articleId
    );

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: 'Article already bookmarked'
      });
    }

    // Add bookmark
    user.bookmarks.push({
      article: articleId,
      bookmarkedAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'Article bookmarked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding bookmark',
      error: error.message
    });
  }
};

// Remove bookmark
const removeBookmark = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove bookmark
    user.bookmarks = user.bookmarks.filter(
      bookmark => bookmark.article.toString() !== articleId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing bookmark',
      error: error.message
    });
  }
};

// Check if article is bookmarked
const checkBookmark = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isBookmarked = user.bookmarks.some(
      bookmark => bookmark.article.toString() === articleId
    );

    res.json({
      success: true,
      data: {
        isBookmarked
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking bookmark',
      error: error.message
    });
  }
};

// Get user preferences
const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('preferences.sources', 'name displayName logoUrl')
      .select('preferences')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences',
      error: error.message
    });
  }
};

// Update user preferences
const updatePreferences = async (req, res) => {
  try {
    const { categories, sources, notifications } = req.body;
    const userId = req.user.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        'preferences.categories': categories,
        'preferences.sources': sources,
        'preferences.notifications': notifications
      },
      { new: true, runValidators: true }
    ).populate('preferences.sources', 'name displayName logoUrl');

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
};

module.exports = {
  getBookmarks,
  addBookmark,
  removeBookmark,
  checkBookmark,
  getPreferences,
  updatePreferences
};