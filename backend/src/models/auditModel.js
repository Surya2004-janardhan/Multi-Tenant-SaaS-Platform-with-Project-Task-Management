// Audit Model
// Database operations for audit_logs table

const db = require('../config/database');

const create = async (auditLog) => {
  const query = `
    INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, ip_address)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [
    auditLog.id,
    auditLog.tenant_id,
    auditLog.user_id,
    auditLog.action,
    auditLog.entity_type,
    auditLog.entity_id,
    auditLog.ip_address,
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const findByTenant = async (tenantId, { page = 1, limit = 50 }) => {
  const query = `
    SELECT * FROM audit_logs
    WHERE tenant_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await db.query(query, [tenantId, limit, (page - 1) * limit]);
  return result.rows;
};

const findByUser = async (userId, { page = 1, limit = 50 }) => {
  const query = `
    SELECT * FROM audit_logs
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await db.query(query, [userId, limit, (page - 1) * limit]);
  return result.rows;
};

module.exports = {
  create,
  findByTenant,
  findByUser,
};
