const express = require('express');
const router = express.Router();
const { createBook, getBooks } = require('../controllers/bookController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateCreateBook } = require('../middleware/validationMiddleware');

// GET /api/books (Public: pagination & genre filtering)
router.get('/', getBooks);

// POST /api/books (Protected: Librarian only)
router.post('/', requireAuth, validateCreateBook, createBook);

module.exports = router;
