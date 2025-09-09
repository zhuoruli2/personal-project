const express = require('express');
const router = express.Router();
const { getBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmarkController');

// Anonymous, clientId required via query or header
router.get('/', getBookmarks);
router.post('/:articleId', addBookmark);
router.delete('/:articleId', removeBookmark);

module.exports = router;

