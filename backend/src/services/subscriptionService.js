// Subscription Service
// Handles subscription limit checking

const { PLAN_LIMITS } = require("../utils/constants");
const tenantModel = require("../models/tenantModel");
const userModel = require("../models/userModel");
const projectModel = require("../models/projectModel");

const checkUserLimit = async (tenantId) => {
  try {
    const tenant = await tenantModel.findById(tenantId);
    if (!tenant) {
      throw new Error("Tenant not found");
    }

    const currentUserCount = await userModel.countByTenant(tenantId);
    const limit = tenant.max_users;

    return {
      canAdd: currentUserCount < limit,
      current: currentUserCount,
      limit: limit,
      remaining: limit - currentUserCount,
    };
  } catch (error) {
    console.error("Error checking user limit:", error);
    throw error;
  }
};

const checkProjectLimit = async (tenantId) => {
  try {
    const tenant = await tenantModel.findById(tenantId);
    if (!tenant) {
      throw new Error("Tenant not found");
    }

    const currentProjectCount = await projectModel.countByTenant(tenantId);
    const limit = tenant.max_projects;

    return {
      canAdd: currentProjectCount < limit,
      current: currentProjectCount,
      limit: limit,
      remaining: limit - currentProjectCount,
    };
  } catch (error) {
    console.error("Error checking project limit:", error);
    throw error;
  }
};

const getPlanLimits = (plan) => {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
};

module.exports = {
  checkUserLimit,
  checkProjectLimit,
  getPlanLimits,
};
