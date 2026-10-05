const express = require('express');
const router = express.Router();
const {
  createMember,
  getMembers,
  getMemberHistory
} = require('../controllers/memberController');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  validateCreateMember,
  validateParamId
} = require('../middleware/validationMiddleware');

// GET /api/members (List all members)
router.get('/', getMembers);

// POST /api/members (Protected: Librarian only)
router.post('/', requireAuth, validateCreateMember, createMember);

// GET /api/members/:id/history (Member's complete borrow history)
router.get('/:id/history', validateParamId('id'), getMemberHistory);

module.exports = router;
