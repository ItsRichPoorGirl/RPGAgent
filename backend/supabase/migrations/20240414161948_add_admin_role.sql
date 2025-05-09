-- Add 'admin' to the account_role enum if it doesn't exist
DO
$$
BEGIN
    -- Check if 'admin' is not already in the enum
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'admin'
        AND enumtypid = (
            SELECT oid
            FROM pg_type
            WHERE typname = 'account_role'
            AND typnamespace = (
                SELECT oid
                FROM pg_namespace
                WHERE nspname = 'basejump'
            )
        )
    ) THEN
        -- Add 'admin' to the enum
        ALTER TYPE basejump.account_role ADD VALUE IF NOT EXISTS 'admin';
    END IF;
END
$$; 