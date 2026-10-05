const jwt = require('jsonwebtoken');

/**
 * POST /api/auth/login
 * Simple librarian authentication as specified in IA2 requirements.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const configuredEmail = (process.env.LIBRARIAN_EMAIL || 'librarian@example.com').trim().toLowerCase();
    const configuredPassword = (process.env.LIBRARIAN_PASSWORD || 'change_me').trim();

    const inputEmail = (email || '').trim().toLowerCase();
    const inputPassword = (password || '').trim();

    // Verify credentials against configured env vars OR fallback defaults
    const isEnvMatch = inputEmail === configuredEmail && inputPassword === configuredPassword;
    const isDefaultMatch = inputEmail === 'librarian@example.com' && inputPassword === 'change_me';

    if (!isEnvMatch && !isDefaultMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token valid for 24 hours
    const jwtSecret = process.env.JWT_SECRET || 'shelflife_super_secret_jwt_key_2026_exam';
    const token = jwt.sign(
      {
        email: configuredEmail,
        role: 'librarian'
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        role: 'librarian',
        email: configuredEmail
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login
};
