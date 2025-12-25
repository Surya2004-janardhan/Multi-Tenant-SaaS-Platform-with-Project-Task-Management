-- Add super admin if not exists
DO $$
BEGIN
    -- Check if super admin exists
    IF NOT EXISTS (
        SELECT 1 FROM users WHERE email = 'superadmin@system.com' AND role = 'super_admin'
    ) THEN
        -- Insert super admin
        INSERT INTO users (tenant_id, email, password_hash, full_name, role)
        VALUES (
            NULL, 
            'superadmin@system.com', 
            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
            'Super Admin', 
            'super_admin'
        );
        RAISE NOTICE 'Super admin created successfully';
    ELSE
        -- Update existing super admin to ensure tenant_id is NULL and role is correct
        UPDATE users 
        SET tenant_id = NULL, role = 'super_admin'
        WHERE email = 'superadmin@system.com';
        RAISE NOTICE 'Super admin already exists - updated to ensure correct settings';
    END IF;
END $$;
