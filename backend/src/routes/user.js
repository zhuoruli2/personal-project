const express = require('express');
const router = express.Router();
const {
  getBookmarks,
  addBookmark,
  removeBookmark,
  checkBookmark,
  getPreferences,
  updatePreferences
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// All user routes require authentication
router.use(auth);

// Bookmark routes
// GET /api/user/bookmarks?page=1&limit=20
router.get('/bookmarks', getBookmarks);

// POST /api/user/bookmarks/60f1b2a3c4a5b6c7d8e9f0a1
router.post('/bookmarks/:articleId', addBookmark);

// DELETE /api/user/bookmarks/60f1b2a3c4a5b6c7d8e9f0a1
router.delete('/bookmarks/:articleId', removeBookmark);

// GET /api/user/bookmarks/60f1b2a3c4a5b6c7d8e9f0a1/check
router.get('/bookmarks/:articleId/check', checkBookmark);

// Preferences routes
// GET /api/user/preferences
router.get('/preferences', getPreferences);

// PUT /api/user/preferences
router.put('/preferences', updatePreferences);

module.exports = router;