// Project Model
// Database operations for projects table

const db = require("../config/database");

const create = async (project) => {
  const query = `
    INSERT INTO projects (tenant_id, name, description, status, created_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [
    project.tenant_id,
    project.name,
    project.description || null,
    project.status || "active",
    project.created_by,
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const findById = async (id) => {
  const query = `
    SELECT p.*, u.full_name as creator_name
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.id = $1
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const findByTenant = async (
  tenantId,
  { status = null, search = null, page = 1, limit = 20 }
) => {
  let query = `
    SELECT p.*,
           u.full_name as creator_name,
           (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
           (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_task_count
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.tenant_id = $1
  `;
  const values = [tenantId];
  let paramCount = 2;

  if (status) {
    query += ` AND p.status = $${paramCount}`;
    values.push(status);
    paramCount++;
  }

  if (search) {
    query += ` AND p.name ILIKE $${paramCount}`;
    values.push(`%${search}%`);
    paramCount++;
  }

  query += " ORDER BY p.created_at DESC";
  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, (page - 1) * limit);

  const result = await db.query(query, values);

  // Get total count
  let countQuery = "SELECT COUNT(*) FROM projects WHERE tenant_id = $1";
  const countValues = [tenantId];
  if (status) {
    countQuery += " AND status = $2";
    countValues.push(status);
  }
  const countResult = await db.query(countQuery, countValues);
  const total = parseInt(countResult.rows[0].count);

  return {
    projects: result.rows,
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
    UPDATE projects
    SET ${fields.join(", ")}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteById = async (id) => {
  const query = "DELETE FROM projects WHERE id = $1 RETURNING id";
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const countByTenant = async (tenantId) => {
  const query = "SELECT COUNT(*) FROM projects WHERE tenant_id = $1";
  const result = await db.query(query, [tenantId]);
  return parseInt(result.rows[0].count);
};

module.exports = {
  create,
  findById,
  findByTenant,
  update,
  deleteById,
  countByTenant,
};
