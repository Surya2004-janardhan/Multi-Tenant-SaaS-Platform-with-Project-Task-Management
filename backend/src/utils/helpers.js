// Helper Functions
// Common utility functions

const { v4: uuidv4 } = require('uuid');

const generateUUID = () => {
  return uuidv4();
};

const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const formatDate = (date) => {
  return new Date(date).toISOString();
};

const buildSuccessResponse = (data, message = null) => {
  return {
    success: true,
    ...(message && { message }),
    ...(data && { data }),
  };
};

const buildErrorResponse = (message, errors = null) => {
  return {
    success: false,
    message,
    ...(errors && { errors }),
  };
};

module.exports = {
  generateUUID,
  isValidUUID,
  formatDate,
  buildSuccessResponse,
  buildErrorResponse,
};
