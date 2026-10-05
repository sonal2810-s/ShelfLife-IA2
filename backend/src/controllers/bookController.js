const Book = require('../models/Book');

/**
 * POST /api/books
 * Add a new book (Protected: Librarian)
 */
const createBook = async (req, res, next) => {
  try {
    const { title, author, ISBN, genre, totalCopies, availableCopies } = req.body;

    // Check if a book with the same ISBN already exists
    const existingBook = await Book.findOne({ ISBN: ISBN.trim() });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: `Book with ISBN '${ISBN}' already exists`
      });
    }

    const initialAvailable =
      availableCopies !== undefined && availableCopies !== null
        ? Number(availableCopies)
        : Number(totalCopies);

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      ISBN: ISBN.trim(),
      genre: genre.trim(),
      totalCopies: Number(totalCopies),
      availableCopies: initialAvailable
    });

    return res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/books
 * List books with pagination, genre filtering, and optional title search
 */
const getBooks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const query = {};

    // Genre filter
    if (req.query.genre && req.query.genre.trim()) {
      query.genre = { $regex: new RegExp(`^${req.query.genre.trim()}$`, 'i') };
    }

    // Optional title search filter
    const searchTerm = req.query.search || req.query.title;
    if (searchTerm && searchTerm.trim()) {
      query.title = { $regex: new RegExp(searchTerm.trim(), 'i') };
    }

    const [books, total] = await Promise.all([
      Book.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Book.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBook,
  getBooks
};
