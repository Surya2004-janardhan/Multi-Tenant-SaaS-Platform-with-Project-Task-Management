// Tenant Context Middleware
// Injects tenant_id from JWT into request context

const tenantContext = (req, res, next) => {
  if (req.user && req.user.tenantId) {
    req.tenantId = req.user.tenantId;
  }
  next();
};

module.exports = tenantContext;
