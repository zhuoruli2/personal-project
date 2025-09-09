const memoryStorage = require('../storage/memoryStorage');

const requireClientId = (req, res) => {
  const clientId = req.query.clientId || req.headers['x-client-id'];
  if (!clientId) {
    res.status(400).json({ success: false, message: 'clientId is required' });
    return null;
  }
  return String(clientId);
};

// GET /api/bookmarks?clientId=...
const getBookmarks = async (req, res) => {
  const clientId = requireClientId(req, res);
  if (!clientId) return;
  const articles = memoryStorage.getBookmarkedArticles(clientId);
  res.json({ success: true, data: articles });
};

// POST /api/bookmarks/:articleId?clientId=...
const addBookmark = async (req, res) => {
  const clientId = requireClientId(req, res);
  if (!clientId) return;
  const { articleId } = req.params;
  const ok = memoryStorage.addBookmark(clientId, articleId);
  if (!ok) {
    return res.status(404).json({ success: false, message: 'Article not found' });
  }
  res.json({ success: true, message: 'Bookmarked' });
};

// DELETE /api/bookmarks/:articleId?clientId=...
const removeBookmark = async (req, res) => {
  const clientId = requireClientId(req, res);
  if (!clientId) return;
  const { articleId } = req.params;
  const ok = memoryStorage.removeBookmark(clientId, articleId);
  if (!ok) {
    return res.status(404).json({ success: false, message: 'Bookmark not found' });
  }
  res.json({ success: true, message: 'Removed' });
};

module.exports = { getBookmarks, addBookmark, removeBookmark };

