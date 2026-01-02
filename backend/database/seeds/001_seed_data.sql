-- Seed Data for Multi-Tenant SaaS Platform
-- Demo login credentials from submission.json
-- ALL PASSWORDS: password123
-- Bcrypt hash (10 rounds): $2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u

-- Clear existing data (for development/testing purposes)
DELETE FROM tasks;
DELETE FROM projects;
DELETE FROM users WHERE role != 'super_admin';
DELETE FROM tenants;
DELETE FROM audit_logs;

-- Reset sequences to ensure consistent IDs
ALTER SEQUENCE tenants_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE projects_id_seq RESTART WITH 1;
ALTER SEQUENCE tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1;

-- Insert Demo Tenants (MATCHES submission.json)
INSERT INTO tenants (name, subdomain, status, subscription_plan, max_projects, max_users)
VALUES 
('TechCorp Solutions', 'techcorp', 'active', 'pro', 15, 25),
('DesignHub Studio', 'designhub', 'active', 'free', 3, 5),
('AcmeCorp', 'acmecorp', 'active', 'free', 3, 5);

-- Insert Super Admin User (system-wide access) if not exists
-- Email: superadmin@system.com, Password: Admin@123
-- Bcrypt hash for Admin@123: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- IMPORTANT: tenant_id MUST BE NULL for super_admin
INSERT INTO users (tenant_id, email, password_hash, full_name, role)
VALUES 
(NULL, 'superadmin@system.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Super Admin', 'super_admin')
ON CONFLICT DO NOTHING;

-- Insert Tenant Users (MATCHES submission.json exactly)
INSERT INTO users (tenant_id, email, password_hash, full_name, role)
VALUES 
-- TechCorp Users (tenant_id: 1)
(1, 'admin@techcorp.com', '$2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u', 'Tech Admin', 'tenant_admin'),
(1, 'john@techcorp.com', '$2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u', 'John Developer', 'user'),
(1, 'sarah@techcorp.com', '$2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u', 'Sarah Designer', 'user'),

-- DesignHub Users (tenant_id: 2)
(2, 'admin@designhub.com', '$2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u', 'Design Admin', 'tenant_admin'),
(2, 'mike@designhub.com', '$2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u', 'Mike Designer', 'user'),

-- AcmeCorp Users (tenant_id: 3) - ADDED TO MATCH submission.json
(3, 'admin@acmecorp.com', '$2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u', 'Acme Admin', 'tenant_admin'),
(3, 'developer@acmecorp.com', '$2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u', 'John Developer', 'user')
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Insert Projects (MATCHES submission.json)
INSERT INTO projects (tenant_id, name, description, status, created_by)
VALUES 
(1, 'Website Redesign', 'Complete website redesign project', 'active', 
  (SELECT id FROM users WHERE email = 'admin@techcorp.com' LIMIT 1)),
(1, 'Mobile App', 'iOS and Android mobile application', 'active',
  (SELECT id FROM users WHERE email = 'admin@techcorp.com' LIMIT 1)),
(2, 'Brand Identity', 'New brand identity design', 'active',
  (SELECT id FROM users WHERE email = 'admin@designhub.com' LIMIT 1)),
(3, 'Updated Website Redesign', 'Redesign with new branding', 'active',
  (SELECT id FROM users WHERE email = 'admin@acmecorp.com' LIMIT 1)),
(3, 'Mobile App Development', 'Mobile application project', 'active',
  (SELECT id FROM users WHERE email = 'admin@acmecorp.com' LIMIT 1));

-- Insert Tasks (Demo data for testing)
INSERT INTO tasks (tenant_id, project_id, title, description, status, priority, assigned_to, due_date, created_by)
SELECT 
  p.tenant_id,
  p.id as project_id,
  'Design homepage mockup' as title,
  'Create modern homepage design' as description,
  'in_progress'::text as status,
  'high'::text as priority,
  (SELECT id FROM users WHERE email = 'john@techcorp.com' AND tenant_id = 1 LIMIT 1) as assigned_to,
  '2025-01-15'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@techcorp.com' AND tenant_id = 1 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Website Redesign' AND p.tenant_id = 1 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Design homepage mockup')

UNION ALL

SELECT 
  p.tenant_id,
  p.id as project_id,
  'Implement responsive layout' as title,
  'Mobile-first responsive design' as description,
  'todo'::text as status,
  'high'::text as priority,
  (SELECT id FROM users WHERE email = 'sarah@techcorp.com' AND tenant_id = 1 LIMIT 1) as assigned_to,
  '2025-01-20'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@techcorp.com' AND tenant_id = 1 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Website Redesign' AND p.tenant_id = 1 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Implement responsive layout')

UNION ALL

SELECT 
  p.tenant_id,
  p.id as project_id,
  'User testing' as title,
  'Conduct usability testing' as description,
  'todo'::text as status,
  'medium'::text as priority,
  (SELECT id FROM users WHERE email = 'john@techcorp.com' AND tenant_id = 1 LIMIT 1) as assigned_to,
  '2025-02-01'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@techcorp.com' AND tenant_id = 1 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Website Redesign' AND p.tenant_id = 1 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'User testing')

UNION ALL

SELECT 
  p.tenant_id,
  p.id as project_id,
  'Setup React Native project' as title,
  'Initialize mobile app project' as description,
  'completed'::text as status,
  'high'::text as priority,
  (SELECT id FROM users WHERE email = 'john@techcorp.com' AND tenant_id = 1 LIMIT 1) as assigned_to,
  '2024-12-20'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@techcorp.com' AND tenant_id = 1 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Mobile App' AND p.tenant_id = 1 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Setup React Native project')

UNION ALL

SELECT 
  p.tenant_id,
  p.id as project_id,
  'Build authentication screen' as title,
  'Login and signup UI' as description,
  'in_progress'::text as status,
  'high'::text as priority,
  (SELECT id FROM users WHERE email = 'sarah@techcorp.com' AND tenant_id = 1 LIMIT 1) as assigned_to,
  '2025-01-10'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@techcorp.com' AND tenant_id = 1 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Mobile App' AND p.tenant_id = 1 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Build authentication screen')

-- Note: Valid task statuses are 'todo', 'in_progress', 'completed' (not 'done')

UNION ALL

SELECT 
  p.tenant_id,
  p.id as project_id,
  'API integration' as title,
  'Connect to backend APIs' as description,
  'todo'::text as status,
  'medium'::text as priority,
  (SELECT id FROM users WHERE email = 'john@techcorp.com' AND tenant_id = 1 LIMIT 1) as assigned_to,
  '2025-01-25'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@techcorp.com' AND tenant_id = 1 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Mobile App' AND p.tenant_id = 1 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'API integration')

UNION ALL

SELECT 
  p.tenant_id,
  p.id as project_id,
  'Define color palette' as title,
  'Primary and secondary brand colors' as description,
  'completed'::text as status,
  'high'::text as priority,
  (SELECT id FROM users WHERE email = 'mike@designhub.com' AND tenant_id = 2 LIMIT 1) as assigned_to,
  '2024-12-15'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@designhub.com' AND tenant_id = 2 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Brand Identity' AND p.tenant_id = 2 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Define color palette')

UNION ALL

SELECT 
  p.tenant_id,
  p.id as project_id,
  'Typography guidelines' as title,
  'Font selections and usage' as description,
  'in_progress'::text as status,
  'high'::text as priority,
  (SELECT id FROM users WHERE email = 'mike@designhub.com' AND tenant_id = 2 LIMIT 1) as assigned_to,
  '2025-01-05'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@designhub.com' AND tenant_id = 2 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Brand Identity' AND p.tenant_id = 2 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Typography guidelines')

UNION ALL

SELECT 
  p.tenant_id,
  p.id as project_id,
  'Logo design' as title,
  'Create brand logo variations' as description,
  'todo'::text as status,
  'medium'::text as priority,
  (SELECT id FROM users WHERE email = 'mike@designhub.com' AND tenant_id = 2 LIMIT 1) as assigned_to,
  '2025-01-12'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@designhub.com' AND tenant_id = 2 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Brand Identity' AND p.tenant_id = 2 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Logo design')

UNION ALL

SELECT 
  p.tenant_id,
  p.id as project_id,
  'Requirements gathering' as title,
  'Collect client requirements' as description,
  'completed'::text as status,
  'high'::text as priority,
  (SELECT id FROM users WHERE email = 'developer@acmecorp.com' AND tenant_id = 3 LIMIT 1) as assigned_to,
  '2024-12-18'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@acmecorp.com' AND tenant_id = 3 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Updated Website Redesign' AND p.tenant_id = 3 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Requirements gathering')

UNION ALL

SELECT 
  p.tenant_id,
  p.id as project_id,
  'Wireframe design' as title,
  'Create initial wireframes' as description,
  'in_progress'::text as status,
  'high'::text as priority,
  (SELECT id FROM users WHERE email = 'developer@acmecorp.com' AND tenant_id = 3 LIMIT 1) as assigned_to,
  '2025-01-08'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@acmecorp.com' AND tenant_id = 3 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Updated Website Redesign' AND p.tenant_id = 3 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Wireframe design')

UNION ALL

SELECT 
  p.tenant_id,
  p.id as project_id,
  'Frontend development' as title,
  'Build website frontend' as description,
  'todo'::text as status,
  'high'::text as priority,
  (SELECT id FROM users WHERE email = 'developer@acmecorp.com' AND tenant_id = 3 LIMIT 1) as assigned_to,
  '2025-01-30'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@acmecorp.com' AND tenant_id = 3 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Updated Website Redesign' AND p.tenant_id = 3 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Frontend development')

UNION ALL

SELECT 
  p.tenant_id,
  p.id as project_id,
  'Technology selection' as title,
  'Choose mobile tech stack' as description,
  'completed'::text as status,
  'high'::text as priority,
  (SELECT id FROM users WHERE email = 'developer@acmecorp.com' AND tenant_id = 3 LIMIT 1) as assigned_to,
  '2024-12-20'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@acmecorp.com' AND tenant_id = 3 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Mobile App Development' AND p.tenant_id = 3 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Technology selection')

UNION ALL

SELECT 
  p.tenant_id,
  p.id as project_id,
  'UI/UX design' as title,
  'Design app user interface' as description,
  'in_progress'::text as status,
  'high'::text as priority,
  (SELECT id FROM users WHERE email = 'developer@acmecorp.com' AND tenant_id = 3 LIMIT 1) as assigned_to,
  '2025-01-12'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@acmecorp.com' AND tenant_id = 3 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Mobile App Development' AND p.tenant_id = 3 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'UI/UX design')

UNION ALL

SELECT 
  p.tenant_id,
  p.id as project_id,
  'Backend API development' as title,
  'Build REST APIs' as description,
  'todo'::text as status,
  'medium'::text as priority,
  (SELECT id FROM users WHERE email = 'developer@acmecorp.com' AND tenant_id = 3 LIMIT 1) as assigned_to,
  '2025-02-01'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@acmecorp.com' AND tenant_id = 3 LIMIT 1) as created_by
FROM projects p
WHERE p.name = 'Mobile App Development' AND p.tenant_id = 3 AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Backend API development');

-- Insert Audit Logs (optional, skipped for simpler seeding)
-- Audit logs will be created automatically when actions occur in the application
