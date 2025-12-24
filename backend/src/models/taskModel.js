// Task Model
// Database operations for tasks table

const db = require("../config/database");

const create = async (task) => {
  const query = `
    INSERT INTO tasks (project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  const values = [
    task.project_id,
    task.tenant_id,
    task.title,
    task.description || null,
    task.status || "todo",
    task.priority || "medium",
    task.assigned_to || null,
    task.due_date || null,
    task.created_by,
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const findById = async (id) => {
  const query = `
    SELECT t.*,
           u.full_name as assigned_user_name,
           u.email as assigned_user_email
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.id = $1
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const findByProject = async (
  projectId,
  {
    status = null,
    priority = null,
    assignedTo = null,
    search = null,
    page = 1,
    limit = 50,
  }
) => {
  let query = `
    SELECT t.*,
           u.full_name as assigned_user_name,
           u.email as assigned_user_email
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.project_id = $1
  `;
  const values = [projectId];
  let paramCount = 2;

  if (status) {
    query += ` AND t.status = $${paramCount}`;
    values.push(status);
    paramCount++;
  }

  if (priority) {
    query += ` AND t.priority = $${paramCount}`;
    values.push(priority);
    paramCount++;
  }

  if (assignedTo) {
    query += ` AND t.assigned_to = $${paramCount}`;
    values.push(assignedTo);
    paramCount++;
  }

  if (search) {
    query += ` AND t.title ILIKE $${paramCount}`;
    values.push(`%${search}%`);
    paramCount++;
  }

  query += " ORDER BY";
  query +=
    " CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,";
  query += " t.due_date ASC NULLS LAST,";
  query += " t.created_at DESC";
  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, (page - 1) * limit);

  const result = await db.query(query, values);

  // Get total count
  let countQuery = "SELECT COUNT(*) FROM tasks WHERE project_id = $1";
  const countValues = [projectId];
  const countResult = await db.query(countQuery, countValues);
  const total = parseInt(countResult.rows[0].count);

  return {
    tasks: result.rows,
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
    UPDATE tasks
    SET ${fields.join(", ")}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteById = async (id) => {
  const query = "DELETE FROM tasks WHERE id = $1 RETURNING id";
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const findByTenant = async (
  tenantId,
  status = null,
  priority = null,
  assignedTo = null
) => {
  let query = `
    SELECT t.*,
           p.name as project_name,
           u.full_name as assigned_user_name,
           u.email as assigned_user_email
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.tenant_id = $1
  `;
  const values = [tenantId];
  let paramCount = 2;

  if (status) {
    query += ` AND t.status = $${paramCount}`;
    values.push(status);
    paramCount++;
  }

  if (priority) {
    query += ` AND t.priority = $${paramCount}`;
    values.push(priority);
    paramCount++;
  }

  if (assignedTo) {
    query += ` AND t.assigned_to = $${paramCount}`;
    values.push(assignedTo);
    paramCount++;
  }

  query += " ORDER BY";
  query +=
    " CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,";
  query += " t.due_date ASC NULLS LAST,";
  query += " t.created_at DESC";

  const result = await db.query(query, values);
  return result.rows;
};

module.exports = {
  create,
  findById,
  findByProject,
  findByTenant,
  update,
  deleteById,
};
