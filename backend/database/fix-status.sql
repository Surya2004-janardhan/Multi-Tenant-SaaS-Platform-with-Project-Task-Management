-- Fix projects and tasks status values

DO $$ 
BEGIN
    -- Fix projects status constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'projects' AND constraint_name = 'projects_status_check'
    ) THEN
        ALTER TABLE projects DROP CONSTRAINT projects_status_check;
        RAISE NOTICE 'Dropped old projects status constraint';
    END IF;

    ALTER TABLE projects 
    ADD CONSTRAINT projects_status_check 
    CHECK (status IN ('active', 'archived', 'completed'));
    RAISE NOTICE 'Added new projects status constraint';

    -- Fix tasks status constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'tasks' AND constraint_name = 'tasks_status_check'
    ) THEN
        ALTER TABLE tasks DROP CONSTRAINT tasks_status_check;
        RAISE NOTICE 'Dropped old tasks status constraint';
    END IF;

    ALTER TABLE tasks 
    ADD CONSTRAINT tasks_status_check 
    CHECK (status IN ('todo', 'in_progress', 'completed'));
    RAISE NOTICE 'Added new tasks status constraint';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Some changes already applied or error: %', SQLERRM;
END $$;
