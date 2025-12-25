-- Seed Data for Multi-Tenant SaaS Platform
-- Demo login credentials from submission.json
-- ALL PASSWORDS: password123
-- Bcrypt hash (10 rounds): $2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u

-- Insert Demo Tenants (MATCHES submission.json)
-- Using ON CONFLICT DO NOTHING to make idempotent
INSERT INTO tenants (name, subdomain, status, subscription_plan, max_projects, max_users)
VALUES 
('TechCorp Solutions', 'techcorp', 'active', 'pro', 15, 25),
('DesignHub Studio', 'designhub', 'active', 'free', 3, 5),
('AcmeCorp', 'acmecorp', 'active', 'free', 3, 5)
ON CONFLICT (subdomain) DO NOTHING;

-- Insert Super Admin User (system-wide access)
-- Email: superadmin@system.com, Password: Admin@123
-- Bcrypt hash for Admin@123: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- IMPORTANT: tenant_id MUST BE NULL for super_admin
INSERT INTO users (tenant_id, email, password_hash, full_name, role)
VALUES 
(NULL, 'superadmin@system.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Super Admin', 'super_admin')
ON CONFLICT (tenant_id, email) DO NOTHING;

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
-- TechCorp Projects
(1, 'Website Redesign', 'Complete website redesign project', 'active', 2),
(1, 'Mobile App', 'iOS and Android mobile application', 'active', 2),

-- DesignHub Projects
(2, 'Brand Identity', 'New brand identity design', 'active', 5),

-- AcmeCorp Projects - ADDED TO MATCH submission.json
(3, 'Updated Website Redesign', 'Redesign with new branding', 'active', 7),
(3, 'Mobile App Development', 'Mobile application project', 'active', 7);

-- Insert Tasks (Demo data for testing)
INSERT INTO tasks (tenant_id, project_id, title, description, status, priority, assigned_to, due_date, created_by)
VALUES 
-- TechCorp - Website Redesign (Project ID: 1)
(1, 1, 'Design homepage mockup', 'Create modern homepage design', 'in_progress', 'high', 3, '2025-01-15', 2),
(1, 1, 'Implement responsive layout', 'Mobile-first responsive design', 'todo', 'high', 4, '2025-01-20', 2),
(1, 1, 'User testing', 'Conduct usability testing', 'todo', 'medium', 3, '2025-02-01', 2),

-- TechCorp - Mobile App (Project ID: 2)
(1, 2, 'Setup React Native project', 'Initialize mobile app project', 'done', 'high', 3, '2024-12-20', 2),
(1, 2, 'Build authentication screen', 'Login and signup UI', 'in_progress', 'high', 4, '2025-01-10', 2),
(1, 2, 'API integration', 'Connect to backend APIs', 'todo', 'medium', 3, '2025-01-25', 2),

-- DesignHub - Brand Identity (Project ID: 3)
(2, 3, 'Define color palette', 'Primary and secondary brand colors', 'done', 'high', 6, '2024-12-15', 5),
(2, 3, 'Typography guidelines', 'Font selections and usage', 'in_progress', 'high', 6, '2025-01-05', 5),
(2, 3, 'Logo design', 'Create brand logo variations', 'todo', 'medium', 6, '2025-01-12', 5),

-- AcmeCorp - Website Redesign (Project ID: 4)
(3, 4, 'Requirements gathering', 'Collect client requirements', 'done', 'high', 8, '2024-12-18', 7),
(3, 4, 'Wireframe design', 'Create initial wireframes', 'in_progress', 'high', 8, '2025-01-08', 7),
(3, 4, 'Frontend development', 'Build website frontend', 'todo', 'high', 8, '2025-01-30', 7),

-- AcmeCorp - Mobile App Development (Project ID: 5)
(3, 5, 'Technology selection', 'Choose mobile tech stack', 'done', 'high', 8, '2024-12-20', 7),
(3, 5, 'UI/UX design', 'Design app user interface', 'in_progress', 'high', 8, '2025-01-12', 7),
(3, 5, 'Backend API development', 'Build REST APIs', 'todo', 'medium', 8, '2025-02-01', 7);

-- Insert Audit Logs
INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, details, ip_address)
VALUES 
(1, 2, 'CREATE', 'project', 1, '{"name": "Website Redesign"}', '192.168.1.100'),
(1, 2, 'CREATE', 'project', 2, '{"name": "Mobile App"}', '192.168.1.100'),
(1, 2, 'CREATE', 'task', 1, '{"title": "Design homepage mockup"}', '192.168.1.100'),
(2, 5, 'CREATE', 'project', 3, '{"name": "Brand Identity"}', '192.168.1.200'),
(2, 5, 'CREATE', 'task', 7, '{"title": "Define color palette"}', '192.168.1.200'),
(3, 7, 'CREATE', 'project', 4, '{"name": "Updated Website Redesign"}', '192.168.1.300'),
(3, 7, 'CREATE', 'project', 5, '{"name": "Mobile App Development"}', '192.168.1.300'),
(3, 7, 'CREATE', 'task', 10, '{"title": "Requirements gathering"}', '192.168.1.300');
