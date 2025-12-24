// Tenant Model
// Database operations for tenants table

const db = require("../config/database");

const create = async (tenant) => {
  const query = `
    INSERT INTO tenants (name, subdomain, subscription_plan, max_users, max_projects)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [
    tenant.name,
    tenant.subdomain,
    tenant.subscription_plan || "free",
    tenant.max_users || 5,
    tenant.max_projects || 3,
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const findById = async (id) => {
  const query = "SELECT * FROM tenants WHERE id = $1";
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const findBySubdomain = async (subdomain) => {
  const query = "SELECT * FROM tenants WHERE subdomain = $1";
  const result = await db.query(query, [subdomain]);
  return result.rows[0];
};

const findAll = async ({ page = 1, limit = 10, subscriptionPlan = null }) => {
  let query = "SELECT * FROM tenants WHERE 1=1";
  const values = [];
  let paramCount = 1;

  if (subscriptionPlan) {
    query += ` AND subscription_plan = $${paramCount}`;
    values.push(subscriptionPlan);
    paramCount++;
  }

  query += " ORDER BY created_at DESC";
  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, (page - 1) * limit);

  const result = await db.query(query, values);

  // Get total count
  let countQuery = "SELECT COUNT(*) FROM tenants WHERE 1=1";
  const countValues = [];
  if (subscriptionPlan) countValues.push(subscriptionPlan);

  const countResult = await db.query(countQuery, countValues);
  const total = parseInt(countResult.rows[0].count);

  return {
    tenants: result.rows,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTenants: total,
      limit,
    },
  };
};

const update = async (id, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach((key) => {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE tenants
    SET ${fields.join(", ")}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await db.query(query, values);
  return result.rows[0];
};

const getStats = async (tenantId) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM users WHERE tenant_id = $1) as total_users,
      (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) as total_projects,
      (SELECT COUNT(*) FROM tasks WHERE tenant_id = $1) as total_tasks
  `;
  const result = await db.query(query, [tenantId]);
  return result.rows[0];
};

module.exports = {
  create,
  findById,
  findBySubdomain,
  findAll,
  update,
  getStats,
};
