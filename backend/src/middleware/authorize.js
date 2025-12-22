// Authorization Middleware
// Checks user roles and permissions

const { buildErrorResponse } = require('../utils/helpers');
const { USER_ROLES } = require('../utils/constants');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        buildErrorResponse('Authentication required')
      );
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json(
        buildErrorResponse('Insufficient permissions. Access denied.')
      );
    }

    next();
  };
};

const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === USER_ROLES.SUPER_ADMIN) {
    return next();
  }
  return res.status(403).json(
    buildErrorResponse('Super admin access required')
  );
};

const isTenantAdmin = (req, res, next) => {
  if (req.user && (req.user.role === USER_ROLES.TENANT_ADMIN || req.user.role === USER_ROLES.SUPER_ADMIN)) {
    return next();
  }
  return res.status(403).json(
    buildErrorResponse('Tenant admin access required')
  );
};

module.exports = {
  authorize,
  isSuperAdmin,
  isTenantAdmin,
};
