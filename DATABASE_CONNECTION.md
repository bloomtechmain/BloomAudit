# Database Connection Architecture: Main System & Weerasinghe ERP

This document explains how the **Bloom Audit (Main System)** and **Weerasinghe ERP (Sub System)** databases are connected and how they interact.

## Overview

The system uses a **Multi-Tenant Database-per-Client** architecture.
- **Physical Separation**: Each client (like Weerasinghe ERP) has its own dedicated PostgreSQL database. This ensures data security and isolation.
- **Logical Connection**: The Sub System backend maintains a secondary connection to the Main System database to verify licenses and global limits.

## Architecture Diagram

```mermaid
graph TD
    subgraph "Sub System Backend (Node.js API)"
        API[API Server]
        Pool1[pool (Primary)]
        Pool2[mainPool (Secondary)]
    end

    subgraph "PostgreSQL Server"
        DB1[(Weerasinghe_ERP_DB)]
        DB2[(BloomAudit_DB)]
    end

    API --> Pool1
    API --> Pool2
    
    Pool1 -- "Reads/Writes Tenant Data (Employees, Tasks, etc.)" --> DB1
    Pool2 -- "Read-Only Check (User Limits, License Status)" --> DB2
```

## Technical Implementation

The connection logic is located in `sub_system/backend/src/db.ts`.

### 1. Dual Connection Pools
The backend initializes **two** separate connection pools:

```typescript
// sub_system/backend/src/db.ts

// 1. Primary Pool: Connects to the Client's Database (Weerasinghe_ERP_DB)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// 2. Secondary Pool: Connects to the Main System Database (BloomAudit_DB)
export const mainPool = new Pool({
  connectionString: process.env.MAIN_SYSTEM_DB_URL
})
```

### 2. Cross-Database Logic (Example: Creating an Employee)
When an admin tries to create a new employee in Weerasinghe ERP, the system performs a cross-database check to enforce the user limit set by Bloom Audit.

**File:** `sub_system/backend/src/controllers/employeeController.ts`

1.  **Identify**: The system identifies which database it is currently running on (e.g., `Weerasinghe_ERP_DB`).
2.  **Verify**: It queries the **Main Database** (`mainPool`) to find the allowed user limit for this specific client.
3.  **Count**: It counts the current employees in the **Client Database** (`pool`).
4.  **Enforce**: If the count exceeds the limit, the request is rejected.

```typescript
// Pseudocode of the logic
const createEmployee = async (req, res) => {
    // 1. Get limit from Main DB
    const limitResult = await mainPool.query(
        'SELECT user_limit FROM erp_projects WHERE db_name = $1', 
        ['Weerasinghe_ERP_DB']
    );
    const limit = limitResult.rows[0].user_limit;

    // 2. Count current users in Client DB
    const countResult = await pool.query('SELECT COUNT(*) FROM employees');
    
    // 3. Block if limit reached
    if (countResult >= limit) {
        return res.error('User limit reached. Contact Bloom Audit.');
    }

    // 4. Create user in Client DB
    await pool.query('INSERT INTO employees ...');
};
```

## Configuration

These connections are defined in the `.env` file of the Sub System backend:

```env
# Primary Connection (The Client's Data)
DATABASE_URL="postgresql://postgres:root@localhost:5432/Weerasinghe_ERP_DB"

# Secondary Connection (The Main System Reference)
MAIN_SYSTEM_DB_URL="postgresql://postgres:root@localhost:5432/BloomAudit_DB"
```
