const { issueBookService, returnBookService } = require('../services/borrowService');

/**
 * POST /api/borrow
 * Issue a book to a member (Protected: Librarian)
 */
const issueBook = async (req, res, next) => {
  try {
    const { bookId, memberId } = req.body;
    const borrowRecord = await issueBookService({ bookId, memberId });

    return res.status(201).json({
      success: true,
      message: 'Book issued successfully',
      data: borrowRecord
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};

/**
 * POST /api/return/:borrowId
 * Return an issued book (Protected: Librarian)
 */
const returnBook = async (req, res, next) => {
  try {
    const { borrowId } = req.params;
    const updatedRecord = await returnBookService(borrowId);

    return res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      data: updatedRecord
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};

module.exports = {
  issueBook,
  returnBook
};
