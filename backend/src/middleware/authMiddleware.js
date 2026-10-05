const jwt = require('jsonwebtoken');

/**
 * Authentication middleware for librarian protected routes.
 * Inspects Authorization: Bearer <token> header, verifies token,
 * and ensures user has the 'librarian' role.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or malformed authorization token'
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'shelflife_super_secret_jwt_key_2026_exam';

  try {
    const decoded = jwt.verify(token, secret);
    
    // Check librarian role
    if (!decoded || decoded.role !== 'librarian') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient privileges (librarian role required)'
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token'
    });
  }
};

module.exports = { requireAuth };
