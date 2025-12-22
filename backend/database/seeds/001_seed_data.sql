-- Seed Data for Multi-Tenant SaaS Platform
-- Run this after migrations to populate initial data

-- Insert Demo Tenant 1: TechCorp
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'TechCorp Solutions', 'techcorp', 'active', 'pro', 25, 15, NOW(), NOW());

-- Insert Demo Tenant 2: DesignHub
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'DesignHub Studio', 'designhub', 'active', 'free', 5, 3, NOW(), NOW());

-- Insert Users for TechCorp
-- Password for all users: Password123! (bcrypt hash with 10 rounds)
-- Hash: $2b$10$K3Zh6Z4kF7WXh6p7QJZqUe5mXj4tZ6l5Y8JqXh9pQ1gN5K8lL2m3K

INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, created_at, updated_at)
VALUES 
-- TechCorp Admin
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'admin@techcorp.com', '$2b$10$K3Zh6Z4kF7WXh6p7QJZqUe5mXj4tZ6l5Y8JqXh9pQ1gN5K8lL2m3K', 'John Smith', 'tenant_admin', NOW(), NOW()),

-- TechCorp Regular Users
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'sarah.johnson@techcorp.com', '$2b$10$K3Zh6Z4kF7WXh6p7QJZqUe5mXj4tZ6l5Y8JqXh9pQ1gN5K8lL2m3K', 'Sarah Johnson', 'user', NOW(), NOW()),

('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'mike.davis@techcorp.com', '$2b$10$K3Zh6Z4kF7WXh6p7QJZqUe5mXj4tZ6l5Y8JqXh9pQ1gN5K8lL2m3K', 'Mike Davis', 'user', NOW(), NOW()),

('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'emily.brown@techcorp.com', '$2b$10$K3Zh6Z4kF7WXh6p7QJZqUe5mXj4tZ6l5Y8JqXh9pQ1gN5K8lL2m3K', 'Emily Brown', 'user', NOW(), NOW());

-- Insert Users for DesignHub
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, created_at, updated_at)
VALUES 
-- DesignHub Admin
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'admin@designhub.com', '$2b$10$K3Zh6Z4kF7WXh6p7QJZqUe5mXj4tZ6l5Y8JqXh9pQ1gN5K8lL2m3K', 'Lisa Chen', 'tenant_admin', NOW(), NOW()),

-- DesignHub Regular User
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'alex.kim@designhub.com', '$2b$10$K3Zh6Z4kF7WXh6p7QJZqUe5mXj4tZ6l5Y8JqXh9pQ1gN5K8lL2m3K', 'Alex Kim', 'user', NOW(), NOW());

-- Insert Projects for TechCorp
INSERT INTO projects (id, tenant_id, name, description, status, created_by, created_at, updated_at)
VALUES 
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Website Redesign', 'Complete overhaul of the company website with modern UI/UX', 'active', '660e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),

('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Mobile App Development', 'Native mobile application for iOS and Android', 'active', '660e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),

('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'API Integration', 'Integrate third-party payment and analytics APIs', 'completed', '660e8400-e29b-41d4-a716-446655440001', NOW(), NOW());

-- Insert Projects for DesignHub
INSERT INTO projects (id, tenant_id, name, description, status, created_by, created_at, updated_at)
VALUES 
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'Brand Identity', 'Create new brand identity and guidelines', 'active', '660e8400-e29b-41d4-a716-446655440010', NOW(), NOW()),

('770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'Marketing Campaign', 'Q4 marketing campaign design assets', 'active', '660e8400-e29b-41d4-a716-446655440010', NOW(), NOW());

-- Insert Tasks for TechCorp Projects
INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at)
VALUES 
-- Website Redesign tasks
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Create wireframes', 'Design wireframes for all main pages', 'completed', 'high', '660e8400-e29b-41d4-a716-446655440002', '2024-01-15', NOW(), NOW()),

('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Develop homepage', 'Implement responsive homepage with React', 'in-progress', 'high', '660e8400-e29b-41d4-a716-446655440003', '2024-01-20', NOW(), NOW()),

('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Setup hosting', 'Configure cloud hosting and CI/CD pipeline', 'todo', 'medium', '660e8400-e29b-41d4-a716-446655440004', '2024-01-25', NOW(), NOW()),

('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Write documentation', 'Create user and developer documentation', 'todo', 'low', NULL, '2024-02-01', NOW(), NOW()),

-- Mobile App Development tasks
('880e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Setup React Native project', 'Initialize project structure and dependencies', 'completed', 'high', '660e8400-e29b-41d4-a716-446655440003', '2024-01-10', NOW(), NOW()),

('880e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Implement authentication', 'User login and registration flow', 'in-progress', 'high', '660e8400-e29b-41d4-a716-446655440002', '2024-01-18', NOW(), NOW()),

('880e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Design app icons', 'Create app icons for iOS and Android', 'todo', 'medium', '660e8400-e29b-41d4-a716-446655440004', '2024-01-22', NOW(), NOW());

-- Insert Tasks for DesignHub Projects
INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at)
VALUES 
-- Brand Identity tasks
('880e8400-e29b-41d4-a716-446655440020', '770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'Logo concepts', 'Create 3 logo concept variations', 'completed', 'high', '660e8400-e29b-41d4-a716-446655440011', '2024-01-12', NOW(), NOW()),

('880e8400-e29b-41d4-a716-446655440021', '770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'Color palette', 'Define brand color palette with accessibility', 'in-progress', 'high', '660e8400-e29b-41d4-a716-446655440011', '2024-01-16', NOW(), NOW()),

('880e8400-e29b-41d4-a716-446655440022', '770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'Typography guide', 'Select fonts and create typography guidelines', 'todo', 'medium', '660e8400-e29b-41d4-a716-446655440011', '2024-01-20', NOW(), NOW()),

-- Marketing Campaign tasks
('880e8400-e29b-41d4-a716-446655440030', '770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'Social media templates', 'Design Instagram and Facebook post templates', 'todo', 'high', '660e8400-e29b-41d4-a716-446655440011', '2024-01-25', NOW(), NOW());

-- Insert Audit Logs
INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address, created_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'login', 'user', '660e8400-e29b-41d4-a716-446655440001', '192.168.1.100', NOW() - INTERVAL '2 hours'),

('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'create', 'project', '770e8400-e29b-41d4-a716-446655440001', '192.168.1.100', NOW() - INTERVAL '1 hour'),

('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'login', 'user', '660e8400-e29b-41d4-a716-446655440002', '192.168.1.101', NOW() - INTERVAL '30 minutes'),

('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440010', 'login', 'user', '660e8400-e29b-41d4-a716-446655440010', '10.0.0.50', NOW() - INTERVAL '45 minutes');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Seed data inserted successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Demo Tenants:';
    RAISE NOTICE '  1. TechCorp Solutions (subdomain: techcorp)';
    RAISE NOTICE '  2. DesignHub Studio (subdomain: designhub)';
    RAISE NOTICE '';
    RAISE NOTICE 'Test Credentials (all users):';
    RAISE NOTICE '  Password: Password123!';
    RAISE NOTICE '';
    RAISE NOTICE 'TechCorp Users:';
    RAISE NOTICE '  - admin@techcorp.com (tenant_admin)';
    RAISE NOTICE '  - sarah.johnson@techcorp.com (user)';
    RAISE NOTICE '  - mike.davis@techcorp.com (user)';
    RAISE NOTICE '  - emily.brown@techcorp.com (user)';
    RAISE NOTICE '';
    RAISE NOTICE 'DesignHub Users:';
    RAISE NOTICE '  - admin@designhub.com (tenant_admin)';
    RAISE NOTICE '  - alex.kim@designhub.com (user)';
    RAISE NOTICE '========================================';
END $$;
