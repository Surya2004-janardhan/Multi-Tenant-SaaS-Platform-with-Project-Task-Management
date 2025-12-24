// Tenant Controller
// Handles: get all tenants, get tenant details, update tenant

const tenantModel = require("../models/tenantModel");
const { logAction } = require("../services/auditService");
const {
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");
const { AUDIT_ACTIONS } = require("../utils/constants");

const getAllTenants = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const tenants = await tenantModel.findAll(page, limit);

    return res.status(200).json(buildSuccessResponse(tenants));
  } catch (error) {
    next(error);
  }
};

const getTenantById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tenant = await tenantModel.findById(id);
    if (!tenant) {
      return res.status(404).json(buildErrorResponse("Tenant not found"));
    }

    // Get tenant stats
    const stats = await tenantModel.getStats(id);

    return res.status(200).json(
      buildSuccessResponse({
        ...tenant,
        stats,
      })
    );
  } catch (error) {
    next(error);
  }
};

const updateTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, subscription_tier } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (subscription_tier) updates.subscription_tier = subscription_tier;

    const updatedTenant = await tenantModel.update(id, updates);
    if (!updatedTenant) {
      return res.status(404).json(buildErrorResponse("Tenant not found"));
    }

    // Log action
    await logAction({
      tenantId: id,
      userId: req.user.userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: "tenant",
      entityId: id,
      ipAddress: req.ip,
    });

    return res
      .status(200)
      .json(buildSuccessResponse(updatedTenant, "Tenant updated successfully"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTenants,
  getTenantById,
  updateTenant,
};
