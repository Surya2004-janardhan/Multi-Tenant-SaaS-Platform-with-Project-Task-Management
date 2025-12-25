-- Fix tenants table schema
-- Add missing subscription_plan column and status column

-- Check if subscription_tier exists and rename it to subscription_plan
DO $$ 
BEGIN
    -- If subscription_tier exists, rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'subscription_tier'
    ) THEN
        ALTER TABLE tenants RENAME COLUMN subscription_tier TO subscription_plan;
        RAISE NOTICE 'Renamed subscription_tier to subscription_plan';
    END IF;

    -- If subscription_plan doesn't exist at all, add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'subscription_plan'
    ) THEN
        ALTER TABLE tenants 
        ADD COLUMN subscription_plan VARCHAR(20) DEFAULT 'free' 
        CHECK (subscription_plan IN ('free', 'pro', 'enterprise'));
        RAISE NOTICE 'Added subscription_plan column';
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'status'
    ) THEN
        ALTER TABLE tenants 
        ADD COLUMN status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'suspended', 'trial'));
        RAISE NOTICE 'Added status column';
    END IF;
END $$;
