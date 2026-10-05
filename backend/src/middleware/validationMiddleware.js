const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Validates Librarian login payload
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  if (!password || typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }

  next();
};

/**
 * Validates Book creation payload
 */
const validateCreateBook = (req, res, next) => {
  const { title, author, ISBN, genre, totalCopies, availableCopies } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Title is required'
    });
  }

  if (!author || typeof author !== 'string' || !author.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Author is required'
    });
  }

  if (!ISBN || typeof ISBN !== 'string' || !ISBN.trim()) {
    return res.status(400).json({
      success: false,
      message: 'ISBN is required'
    });
  }

  if (!genre || typeof genre !== 'string' || !genre.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Genre is required'
    });
  }

  if (totalCopies === undefined || totalCopies === null || typeof totalCopies !== 'number' || totalCopies < 1) {
    return res.status(400).json({
      success: false,
      message: 'totalCopies must be a number greater than or equal to 1'
    });
  }

  if (availableCopies !== undefined && availableCopies !== null) {
    if (typeof availableCopies !== 'number' || availableCopies < 0) {
      return res.status(400).json({
        success: false,
        message: 'availableCopies cannot be negative'
      });
    }

    if (availableCopies > totalCopies) {
      return res.status(400).json({
        success: false,
        message: 'availableCopies cannot exceed totalCopies'
      });
    }
  }

  next();
};

/**
 * Validates Member creation payload
 */
const validateCreateMember = (req, res, next) => {
  const { name, email, membershipId } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Member name is required'
    });
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  if (!membershipId || typeof membershipId !== 'string' || !membershipId.trim()) {
    return res.status(400).json({
      success: false,
      message: 'membershipId is required'
    });
  }

  next();
};

/**
 * Validates Issue / Borrow request payload
 */
const validateBorrow = (req, res, next) => {
  const { bookId, memberId } = req.body;

  if (!bookId || !isValidObjectId(bookId)) {
    return res.status(400).json({
      success: false,
      message: 'A valid bookId is required'
    });
  }

  if (!memberId || !isValidObjectId(memberId)) {
    return res.status(400).json({
      success: false,
      message: 'A valid memberId is required'
    });
  }

  next();
};

/**
 * Validates ObjectId parameter (e.g. :id or :borrowId)
 */
const validateParamId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (!id || !isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${paramName} parameter format`
    });
  }
  next();
};

module.exports = {
  validateLogin,
  validateCreateBook,
  validateCreateMember,
  validateBorrow,
  validateParamId
};
