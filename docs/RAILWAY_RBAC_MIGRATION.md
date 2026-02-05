# Railway Database Migration: RBAC Tables

## Issue
Login endpoint was failing with error:
```
/auth/login error error: relation "user_roles" does not exist
```

## Root Cause
After fixing the `password_must_change` column issue, a second schema mismatch was discovered. The Railway production database was missing the complete RBAC (Role-Based Access Control) table structure required by the login endpoint.

## Migration Applied
Date: February 4, 2026

### RBAC Tables Created

**1. `roles` table**
Stores available roles in the system (e.g., Admin, Manager, User)
```sql
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2. `permissions` table**
Defines granular permissions (resource:action pairs)
```sql
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resource, action)
);
```

**3. `role_permissions` table**
Maps which permissions belong to which roles
```sql
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
```

**4. `user_roles` table** (The Missing Table)
Junction table enabling many-to-many relationship between users and roles
```sql
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

**5. `rbac_audit_log` table**
Tracks RBAC-related actions for security compliance
```sql
CREATE TABLE IF NOT EXISTS rbac_audit_log (
  id SERIAL PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

## Verification
Confirmed all RBAC tables exist in Railway database:
```
Table Name         | Status
-------------------|---------
password_history   | ✅ Exists
permissions        | ✅ Exists
rbac_audit_log     | ✅ Exists
role_permissions   | ✅ Exists
roles              | ✅ Exists
user_roles         | ✅ Exists
```

## Features Enabled
This migration enables comprehensive RBAC functionality:
- **Multiple Roles Per User**: Users can have multiple roles simultaneously
- **Granular Permissions**: Fine-grained access control at resource:action level
- **Role-Based Access**: Permissions inherited from assigned roles
- **Audit Logging**: Track all RBAC-related changes
- **Flexible Authorization**: Dynamic permission checking in middleware

## Login Flow After Migration
The `/auth/login` endpoint now successfully:
1. Authenticates user credentials
2. Queries `user_roles` to get all assigned roles
3. Queries `role_permissions` to get all permissions from those roles
4. Returns JWT token with user info, roles, and permissions
5. Frontend can use permissions for UI-level authorization

## Connection Details
- Database: Railway PostgreSQL
- Host: trolley.proxy.rlwy.net:18297
- Database: railway
- Migration executed via: psql CLI

## Status
✅ All RBAC tables created successfully
✅ Login endpoint should now be fully functional
✅ Multi-role authorization system active

## Next Steps
To fully utilize the RBAC system:
1. Run `seedRBAC.ts` script to populate roles and permissions
2. Assign roles to users via `user_roles` table
3. Use authorization middleware to protect routes
4. Implement UI-level permission checks

---
**Related Files:**
- RBAC creation: `backend/src/scripts/createRBACTables.ts`
- Multi-role migration: `backend/src/scripts/alterRBACForMultipleRoles.ts`
- Authorization middleware: `backend/src/middleware/authorize.ts`
- Login endpoint: `backend/src/index.ts` (POST `/auth/login`)

**Previous Migration:**
- Password management features: `docs/DATABASE_MIGRATION_PASSWORD_FEATURES.md`
