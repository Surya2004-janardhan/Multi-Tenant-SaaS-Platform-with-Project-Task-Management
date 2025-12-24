-- Seed Data for Multi-Tenant SaaS Platform
-- Demo login credentials: email=admin@techcorp.com, password=password123

-- Insert Demo Tenants
INSERT INTO tenants (name, subdomain, subscription_tier, max_projects, max_users)
VALUES 
('TechCorp Solutions', 'techcorp', 'pro', 25, 15),
('DesignHub Studio', 'designhub', 'free', 5, 3);

-- Insert Users
-- Password for all demo users: password123
-- Bcrypt hash (10 rounds): $2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u

INSERT INTO users (tenant_id, email, password_hash, full_name, role)
VALUES 
-- TechCorp Users (tenant_id: 1)
(1, 'admin@techcorp.com', '$2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u', 'John Smith', 'tenant_admin'),
(1, 'sarah@techcorp.com', '$2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u', 'Sarah Johnson', 'user'),
(1, 'mike@techcorp.com', '$2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u', 'Mike Davis', 'user'),
(1, 'emily@techcorp.com', '$2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u', 'Emily Brown', 'user'),

-- DesignHub Users (tenant_id: 2)
(2, 'admin@designhub.com', '$2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u', 'Lisa Chen', 'tenant_admin'),
(2, 'alex@designhub.com', '$2b$10$rOj3aGJGVKxPkZvqJl6Lou6F7HhEi3Q1iBq8.Y.6bxZ1N1Y.7zX2u', 'Alex Kim', 'user');

-- Insert Projects
INSERT INTO projects (tenant_id, name, description, status, created_by)
VALUES 
-- TechCorp Projects
(1, 'Mobile App Redesign', 'Complete overhaul of our flagship mobile application', 'active', 1),
(1, 'API Documentation', 'Comprehensive API documentation for v2.0', 'planning', 1),
(1, 'Customer Portal', 'New self-service customer portal', 'active', 2),

-- DesignHub Projects
(2, 'Brand Guidelines', 'Create comprehensive brand identity guidelines', 'active', 5),
(2, 'Website Mockups', 'Design mockups for client website', 'planning', 5);

-- Insert Tasks
INSERT INTO tasks (tenant_id, project_id, title, description, status, priority, assigned_to, due_date, created_by)
VALUES 
-- Mobile App Redesign (Project ID: 1)
(1, 1, 'Design new UI components', 'Create reusable UI component library', 'in_progress', 'high', 2, '2025-01-15', 1),
(1, 1, 'Implement authentication flow', 'OAuth 2.0 integration', 'todo', 'high', 3, '2025-01-20', 1),
(1, 1, 'User testing', 'Conduct user testing sessions', 'todo', 'medium', 4, '2025-02-01', 1),

-- API Documentation (Project ID: 2)
(1, 2, 'Write endpoint descriptions', 'Document all REST endpoints', 'in_progress', 'medium', 2, '2025-01-10', 1),
(1, 2, 'Add code examples', 'Provide code samples in multiple languages', 'todo', 'low', 3, '2025-01-25', 1),

-- Customer Portal (Project ID: 3)
(1, 3, 'Setup authentication', 'Integrate with existing auth system', 'done', 'high', 2, '2024-12-20', 2),
(1, 3, 'Build dashboard', 'Customer analytics dashboard', 'in_progress', 'high', 3, '2025-01-18', 2),
(1, 3, 'Payment integration', 'Stripe payment gateway integration', 'todo', 'medium', 4, '2025-01-30', 2),

-- Brand Guidelines (Project ID: 4)
(2, 4, 'Define color palette', 'Primary and secondary brand colors', 'done', 'high', 5, '2024-12-15', 5),
(2, 4, 'Typography guidelines', 'Font selections and usage rules', 'in_progress', 'high', 6, '2025-01-05', 5),
(2, 4, 'Logo variations', 'Create logo variations for different uses', 'todo', 'medium', 5, '2025-01-12', 5);

-- Insert Audit Logs
INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, details, ip_address)
VALUES 
(1, 1, 'CREATE', 'project', 1, '{"name": "Mobile App Redesign"}', '192.168.1.100'),
(1, 1, 'CREATE', 'task', 1, '{"title": "Design new UI components"}', '192.168.1.100'),
(1, 2, 'UPDATE', 'task', 6, '{"status": "done"}', '192.168.1.101'),
(2, 5, 'CREATE', 'project', 4, '{"name": "Brand Guidelines"}', '192.168.1.200'),
(2, 5, 'CREATE', 'task', 9, '{"title": "Define color palette"}', '192.168.1.200');
