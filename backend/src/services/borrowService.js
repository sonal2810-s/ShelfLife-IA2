const Book = require('../models/Book');
const Member = require('../models/Member');
const BorrowRecord = require('../models/BorrowRecord');

/**
 * RACE CONDITION PREVENTION EXPLANATION (IA2 Exam Requirement):
 * In concurrent environments, traditional check-then-act logic (reading availableCopies,
 * checking > 0, then saving) allows two simultaneous requests to issue the last copy.
 * ShelfLife prevents this using an atomic MongoDB operation: findOneAndUpdate with
 * condition { availableCopies: { $gt: 0 } } and operator { $inc: { availableCopies: -1 } }.
 * MongoDB's document-level write lock ensures only one request succeeds; the second
 * finds 0 available copies, returns null, and is immediately rejected safely.
 */

/**
 * Service to issue a book to a member atomically
 */
const issueBookService = async ({ bookId, memberId }) => {
  // Step 1: Verify member exists before mutating inventory
  const member = await Member.findById(memberId);
  if (!member) {
    const error = new Error('Member not found');
    error.statusCode = 404;
    throw error;
  }

  // Step 2: Atomic inventory decrement preventing race conditions
  const updatedBook = await Book.findOneAndUpdate(
    {
      _id: bookId,
      availableCopies: { $gt: 0 }
    },
    {
      $inc: { availableCopies: -1 }
    },
    {
      returnDocument: 'after'
    }
  );

  if (!updatedBook) {
    const error = new Error('Book is unavailable or has 0 available copies');
    error.statusCode = 400;
    throw error;
  }

  try {
    // Step 3: Create the borrow record (14 days standard loan duration)
    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    const borrowRecord = await BorrowRecord.create({
      book: bookId,
      member: memberId,
      issueDate,
      dueDate,
      returnDate: null,
      status: 'issued'
    });

    const populatedRecord = await BorrowRecord.findById(borrowRecord._id)
      .populate('book', 'title author ISBN genre availableCopies totalCopies')
      .populate('member', 'name email membershipId');

    return populatedRecord;
  } catch (err) {
    // Compensating action: restore book copy if BorrowRecord creation fails
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } });
    throw err;
  }
};

/**
 * Service to return an issued book
 */
const returnBookService = async (borrowId) => {
  const record = await BorrowRecord.findById(borrowId);
  if (!record) {
    const error = new Error('Borrow record not found');
    error.statusCode = 404;
    throw error;
  }

  if (record.status === 'returned' || record.returnDate !== null) {
    const error = new Error('This borrow record has already been marked as returned');
    error.statusCode = 400;
    throw error;
  }

  // Mark record returned and record timestamp
  record.returnDate = new Date();
  record.status = 'returned';
  await record.save();

  // Increment available copies on the associated book
  await Book.findByIdAndUpdate(record.book, {
    $inc: { availableCopies: 1 }
  });

  const updatedRecord = await BorrowRecord.findById(borrowId)
    .populate('book', 'title author ISBN genre availableCopies totalCopies')
    .populate('member', 'name email membershipId');

  return updatedRecord;
};

module.exports = {
  issueBookService,
  returnBookService
};
