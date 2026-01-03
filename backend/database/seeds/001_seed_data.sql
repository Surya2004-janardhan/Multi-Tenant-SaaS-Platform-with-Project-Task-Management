-- Seed Data for Multi-Tenant SaaS Platform
-- Credentials from requirements specification
-- Password: Admin@123 = $2a$10$fxkaxC0626CGOJun1K5eIeg4.CN7oVxatEI65Q54bT3sHCUq4lc9u
-- Password: Demo@123 = $2a$10$IW.E7/7Q9hh.pKgePCqYwOxm0MaQYlKhyHOZZqbgwWlCR8g8lnVrW
-- Password: User@123 = $2a$10$vkQ3Qz8qH5K6L9mR2X4pF.nZ0D8rY5tV1W2x3B4c5D6e7F8g9H0

-- Clear existing data (for development/testing purposes)
DELETE FROM tasks;
DELETE FROM projects;
DELETE FROM users;
DELETE FROM tenants;
DELETE FROM audit_logs;

-- Reset sequences to ensure consistent IDs
ALTER SEQUENCE tenants_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE projects_id_seq RESTART WITH 1;
ALTER SEQUENCE tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1;

-- Insert Demo Tenant (as per requirements)
INSERT INTO tenants (name, subdomain, status, subscription_plan, max_projects, max_users)
VALUES 
('Demo Company', 'demo', 'active', 'pro', 15, 25);

-- Insert Super Admin User (system-wide access)
-- Email: superadmin@system.com, Password: Admin@123
-- IMPORTANT: tenant_id MUST BE NULL for super_admin
INSERT INTO users (tenant_id, email, password_hash, full_name, role)
VALUES 
(NULL, 'superadmin@system.com', '$2a$10$fxkaxC0626CGOJun1K5eIeg4.CN7oVxatEI65Q54bT3sHCUq4lc9u', 'Super Admin', 'super_admin');

-- Insert Demo Company Tenant Admin
-- Email: admin@demo.com, Password: Demo@123
INSERT INTO users (tenant_id, email, password_hash, full_name, role)
VALUES 
(1, 'admin@demo.com', '$2a$10$IW.E7/7Q9hh.pKgePCqYwOxm0MaQYlKhyHOZZqbgwWlCR8g8lnVrW', 'Demo Admin', 'tenant_admin');

-- Insert Demo Company Regular Users
-- User 1: user1@demo.com / User@123
-- User 2: user2@demo.com / User@123
INSERT INTO users (tenant_id, email, password_hash, full_name, role)
VALUES 
(1, 'user1@demo.com', '$2a$10$vkQ3Qz8qH5K6L9mR2X4pF.nZ0D8rY5tV1W2x3B4c5D6e7F8g9H0', 'Demo User One', 'user'),
(1, 'user2@demo.com', '$2a$10$vkQ3Qz8qH5K6L9mR2X4pF.nZ0D8rY5tV1W2x3B4c5D6e7F8g9H0', 'Demo User Two', 'user');

-- Insert Demo Company Projects (2 projects as per requirements)
INSERT INTO projects (tenant_id, name, description, status, created_by)
VALUES 
(1, 'Project Alpha', 'First demo project', 'active', 
  (SELECT id FROM users WHERE email = 'admin@demo.com' LIMIT 1)),
(1, 'Project Beta', 'Second demo project', 'active',
  (SELECT id FROM users WHERE email = 'admin@demo.com' LIMIT 1));

-- Insert Demo Company Tasks (5 tasks as per requirements)
INSERT INTO tasks (tenant_id, project_id, title, description, status, priority, assigned_to, due_date, created_by)
SELECT 
  1 as tenant_id,
  (SELECT id FROM projects WHERE name = 'Project Alpha' AND tenant_id = 1 LIMIT 1) as project_id,
  'Task 1: Design mockup' as title,
  'Create initial design mockup' as description,
  'in_progress'::text as status,
  'high'::text as priority,
  (SELECT id FROM users WHERE email = 'user1@demo.com' AND tenant_id = 1 LIMIT 1) as assigned_to,
  '2025-01-15'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@demo.com' AND tenant_id = 1 LIMIT 1) as created_by

UNION ALL

SELECT 
  1 as tenant_id,
  (SELECT id FROM projects WHERE name = 'Project Alpha' AND tenant_id = 1 LIMIT 1) as project_id,
  'Task 2: Review design' as title,
  'Get stakeholder feedback on design' as description,
  'todo'::text as status,
  'high'::text as priority,
  (SELECT id FROM users WHERE email = 'user2@demo.com' AND tenant_id = 1 LIMIT 1) as assigned_to,
  '2025-01-20'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@demo.com' AND tenant_id = 1 LIMIT 1) as created_by

UNION ALL

SELECT 
  1 as tenant_id,
  (SELECT id FROM projects WHERE name = 'Project Beta' AND tenant_id = 1 LIMIT 1) as project_id,
  'Task 3: Setup environment' as title,
  'Initialize development environment' as description,
  'completed'::text as status,
  'high'::text as priority,
  (SELECT id FROM users WHERE email = 'user1@demo.com' AND tenant_id = 1 LIMIT 1) as assigned_to,
  '2025-01-10'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@demo.com' AND tenant_id = 1 LIMIT 1) as created_by

UNION ALL

SELECT 
  1 as tenant_id,
  (SELECT id FROM projects WHERE name = 'Project Beta' AND tenant_id = 1 LIMIT 1) as project_id,
  'Task 4: Implement features' as title,
  'Build core application features' as description,
  'in_progress'::text as status,
  'medium'::text as priority,
  (SELECT id FROM users WHERE email = 'user2@demo.com' AND tenant_id = 1 LIMIT 1) as assigned_to,
  '2025-02-01'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@demo.com' AND tenant_id = 1 LIMIT 1) as created_by

UNION ALL

SELECT 
  1 as tenant_id,
  (SELECT id FROM projects WHERE name = 'Project Beta' AND tenant_id = 1 LIMIT 1) as project_id,
  'Task 5: Testing' as title,
  'Conduct comprehensive testing' as description,
  'todo'::text as status,
  'medium'::text as priority,
  NULL as assigned_to,
  '2025-02-15'::DATE as due_date,
  (SELECT id FROM users WHERE email = 'admin@demo.com' AND tenant_id = 1 LIMIT 1) as created_by;
