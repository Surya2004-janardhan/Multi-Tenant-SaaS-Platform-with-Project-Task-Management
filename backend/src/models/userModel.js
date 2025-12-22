// User Model
// Database operations for users table

const db = require("../config/database");

const create = async (user) => {
  const query = `
    INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, tenant_id, email, full_name, role, is_active, created_at, updated_at
  `;
  const values = [
    user.id,
    user.tenant_id,
    user.email,
    user.password_hash,
    user.full_name,
    user.role || "user",
    user.is_active !== undefined ? user.is_active : true,
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const findById = async (id) => {
  const query = `
    SELECT id, tenant_id, email, full_name, role, is_active, created_at, updated_at
    FROM users
    WHERE id = $1
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const findByIdWithPassword = async (id) => {
  const query = "SELECT * FROM users WHERE id = $1";
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const findByEmail = async (email, tenantId) => {
  const query = `
    SELECT * FROM users
    WHERE email = $1 AND (tenant_id = $2 OR tenant_id IS NULL)
  `;
  const result = await db.query(query, [email, tenantId]);
  return result.rows[0];
};

const findByEmailWithPassword = async (email, tenantId) => {
  const query = `
    SELECT * FROM users
    WHERE email = $1 AND tenant_id = $2
  `;
  const result = await db.query(query, [email, tenantId]);
  return result.rows[0];
};

const findByTenant = async (
  tenantId,
  { search = null, role = null, page = 1, limit = 50 }
) => {
  let query = `
    SELECT id, tenant_id, email, full_name, role, is_active, created_at, updated_at
    FROM users
    WHERE tenant_id = $1
  `;
  const values = [tenantId];
  let paramCount = 2;

  if (search) {
    query += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
    values.push(`%${search}%`);
    paramCount++;
  }

  if (role) {
    query += ` AND role = $${paramCount}`;
    values.push(role);
    paramCount++;
  }

  query += " ORDER BY created_at DESC";
  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, (page - 1) * limit);

  const result = await db.query(query, values);

  // Get total count
  let countQuery = "SELECT COUNT(*) FROM users WHERE tenant_id = $1";
  const countValues = [tenantId];
  const countResult = await db.query(countQuery, countValues);
  const total = parseInt(countResult.rows[0].count);

  return {
    users: result.rows,
    total,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
  };
};

const update = async (id, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach((key) => {
    if (updates[key] !== undefined && key !== "id") {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = $${paramCount}
    RETURNING id, tenant_id, email, full_name, role, is_active, created_at, updated_at
  `;

  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteById = async (id) => {
  const query = "DELETE FROM users WHERE id = $1 RETURNING id";
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const countByTenant = async (tenantId) => {
  const query = "SELECT COUNT(*) FROM users WHERE tenant_id = $1";
  const result = await db.query(query, [tenantId]);
  return parseInt(result.rows[0].count);
};

module.exports = {
  create,
  findById,
  findByIdWithPassword,
  findByEmail,
  findByEmailWithPassword,
  findByTenant,
  update,
  deleteById,
  countByTenant,
};
