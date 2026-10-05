const Member = require('../models/Member');
const BorrowRecord = require('../models/BorrowRecord');

/**
 * POST /api/members
 * Register a new member (Protected: Librarian)
 */
const createMember = async (req, res, next) => {
  try {
    const { name, email, membershipId } = req.body;

    // Check for duplicate email
    const existingEmail = await Member.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Member with email '${email.trim()}' already exists`
      });
    }

    // Check for duplicate membershipId
    const existingMemberId = await Member.findOne({ membershipId: membershipId.trim() });
    if (existingMemberId) {
      return res.status(400).json({
        success: false,
        message: `Member with membership ID '${membershipId.trim()}' already exists`
      });
    }

    const member = await Member.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      membershipId: membershipId.trim(),
      joinedDate: req.body.joinedDate ? new Date(req.body.joinedDate) : new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Member registered successfully',
      data: member
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/members
 * List all members (Public or librarian view)
 */
const getMembers = async (req, res, next) => {
  try {
    const members = await Member.find().sort({ joinedDate: -1 });
    return res.status(200).json({
      success: true,
      data: members
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/members/:id/history
 * Return complete borrow history for a member.
 * Overdue logic: if status is 'issued' and dueDate < today and returnDate is null,
 * the status is computed/updated to 'overdue'.
 */
const getMemberHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const records = await BorrowRecord.find({ member: id })
      .populate('book', 'title author ISBN genre totalCopies availableCopies')
      .populate('member', 'name email membershipId joinedDate')
      .sort({ issueDate: -1 });

    const now = new Date();

    // Reconcile overdue status for active records where due date has passed
    const reconciledRecords = await Promise.all(
      records.map(async (record) => {
        if (record.status === 'issued' && record.returnDate === null && new Date(record.dueDate) < now) {
          record.status = 'overdue';
          await record.save();
        }
        return record;
      })
    );

    return res.status(200).json({
      success: true,
      member,
      data: reconciledRecords
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMember,
  getMembers,
  getMemberHistory
};
