const express = require('express');
const router = express.Router();
const { issueBook, returnBook } = require('../controllers/borrowController');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  validateBorrow,
  validateParamId
} = require('../middleware/validationMiddleware');

// POST /api/borrow (Issue a book - Protected: Librarian)
router.post('/', requireAuth, validateBorrow, issueBook);

// POST /api/borrow/return/:borrowId (Alias for return)
router.post('/return/:borrowId', requireAuth, validateParamId('borrowId'), returnBook);

module.exports = router;
