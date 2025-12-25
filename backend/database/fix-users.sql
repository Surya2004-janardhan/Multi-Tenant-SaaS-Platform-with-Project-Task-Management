-- Fix users table schema
-- Add is_active column and super_admin role

DO $$ 
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to users';
    END IF;

    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' AND constraint_name = 'users_role_check'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
        RAISE NOTICE 'Dropped old role constraint';
    END IF;

    -- Add new constraint with super_admin
    ALTER TABLE users 
    ADD CONSTRAINT users_role_check 
    CHECK (role IN ('super_admin', 'tenant_admin', 'user'));
    RAISE NOTICE 'Added new role constraint with super_admin';

    -- Make tenant_id nullable for super_admin
    ALTER TABLE users ALTER COLUMN tenant_id DROP NOT NULL;
    RAISE NOTICE 'Made tenant_id nullable';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Some changes already applied or error: %', SQLERRM;
END $$;
