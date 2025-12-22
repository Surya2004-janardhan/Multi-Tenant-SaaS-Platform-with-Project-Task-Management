// Authentication Middleware
// Verifies JWT token and extracts user information

const { verifyToken } = require('../services/tokenService');
const { buildErrorResponse } = require('../utils/helpers');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        buildErrorResponse('No token provided. Authentication required.')
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token);
      req.user = {
        userId: decoded.userId,
        tenantId: decoded.tenantId,
        role: decoded.role,
      };
      next();
    } catch (error) {
      return res.status(401).json(
        buildErrorResponse(error.message || 'Invalid or expired token')
      );
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json(
      buildErrorResponse('Authentication failed')
    );
  }
};

module.exports = authenticate;
