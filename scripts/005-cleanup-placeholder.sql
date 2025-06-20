-- Optional: Run this script to clean up placeholder data after setup is complete
-- Only run this AFTER successful setup verification

-- Remove placeholder user if real admin exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@judgingportal.com' AND role = 'admin') THEN
        -- First remove from profiles
        DELETE FROM profiles WHERE id = '00000000-0000-0000-0000-000000000000';
        
        -- Then try to remove from auth.users (may fail due to permissions, that's OK)
        BEGIN
            DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000000';
            RAISE NOTICE 'Successfully cleaned up placeholder auth user.';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not remove placeholder auth user (this is normal in hosted Supabase): %', SQLERRM;
        END;
        
        RAISE NOTICE 'Placeholder cleanup completed.';
    ELSE
        RAISE NOTICE 'Real admin user not found. Keeping placeholder user.';
    END IF;
END $$;
