# Database Migration: Password Management Features

## Issue
Login endpoint was failing with error:
```
/auth/login error error: column u.password_must_change does not exist
```

## Root Cause
The Railway production database was missing the `password_must_change` column and `password_history` table that exist in the local development database. This caused a schema mismatch.

## Migration Applied
Date: February 4, 2026

### Changes Made to Railway PostgreSQL Database

**1. Added `password_must_change` column to `users` table:**
```sql
ALTER TABLE users ADD COLUMN password_must_change BOOLEAN DEFAULT FALSE;
```

**2. Created `password_history` table:**
```sql
CREATE TABLE IF NOT EXISTS password_history (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_password_history_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_history_user_id 
  ON password_history(user_id);

CREATE INDEX IF NOT EXISTS idx_password_history_created_at 
  ON password_history(created_at DESC);
```

## Verification
Confirmed column exists:
```
column_name           | data_type | column_default
----------------------+-----------+----------------
password_must_change  | boolean   | false
```

## Features Enabled
This migration enables the following password management features:
- **Force Password Change**: Ability to require users to change their password on next login
- **Password History**: Track last 3 passwords to prevent password reuse
- **Password Strength Validation**: Enforce strong password requirements
- **Password Change Audit**: Log password changes for security compliance

## Connection Details Used
- Database: Railway PostgreSQL
- Host: trolley.proxy.rlwy.net:18297
- Database: railway
- Migration executed via: psql CLI

## Status
✅ Migration completed successfully
✅ Login endpoint now functional
✅ Password management features enabled

## Future Migrations
For any future schema changes, ensure to:
1. Test migrations locally first
2. Apply to Railway production database
3. Document the changes
4. Verify the changes were applied correctly

---
**Related Files:**
- Migration script: `backend/src/scripts/addPasswordManagementFeatures.ts`
- Password utilities: `backend/src/utils/passwordGenerator.ts`, `backend/src/utils/passwordHistory.ts`
- Login endpoint: `backend/src/index.ts` (POST `/auth/login`)
