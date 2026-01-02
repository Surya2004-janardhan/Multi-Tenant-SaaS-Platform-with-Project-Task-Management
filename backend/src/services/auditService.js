// Audit Service
// Handles audit logging for all actions

const auditModel = require("../models/auditModel");

const logAction = async ({
  tenantId,
  userId,
  action,
  entityType,
  entityId,
  ipAddress,
}) => {
  try {
    const auditLog = {
      tenant_id: tenantId || null,
      user_id: userId || null,
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      ip_address: ipAddress || null,
      details: null,
    };

    await auditModel.create(auditLog);
    console.log("Audit log created:", action);
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw error - audit logging should not break the main operation
  }
};

module.exports = {
  logAction,
};
