// Health Controller
// Handles: health check endpoint

const { query } = require('../config/database');
const { buildSuccessResponse, buildErrorResponse } = require('../utils/helpers');

const healthCheck = async (req, res) => {
  try {
    // Check database connection
    await query('SELECT 1');

    return res.status(200).json(
      buildSuccessResponse({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
      }, 'API is healthy')
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(503).json(
      buildErrorResponse('Service unavailable')
    );
  }
};

module.exports = {
  healthCheck,
};
