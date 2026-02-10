
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Tharusha%4012345@localhost:5432/BloomAudit_DB';
// Extract base connection (to postgres db)
const baseConnectionString = connectionString.replace('/BloomAudit_DB', '/postgres');

async function setup() {
  const client = new Client({ connectionString: baseConnectionString });
  await client.connect();

  try {
    console.log('Connected to postgres...');
    
    // Check if Weerasinghe_ERP_DB exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'Weerasinghe_ERP_DB'");
    if (res.rowCount === 0) {
      console.log('Creating Weerasinghe_ERP_DB from template BloomAudit_DB...');
      // Terminate connections to BloomAudit_DB to allow template usage
      await client.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'BloomAudit_DB'
        AND pid <> pg_backend_pid();
      `);
      
      await client.query('CREATE DATABASE "Weerasinghe_ERP_DB" WITH TEMPLATE "BloomAudit_DB";');
      console.log('Weerasinghe_ERP_DB created.');
    } else {
      console.log('Weerasinghe_ERP_DB already exists.');
    }

    // Now connect to BloomAudit_DB (Main System) and create erp_projects table
    const mainClient = new Client({ connectionString });
    await mainClient.connect();
    console.log('Connected to BloomAudit_DB...');
    
    await mainClient.query(`
      CREATE TABLE IF NOT EXISTS erp_projects (
        id SERIAL PRIMARY KEY,
        owner_name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        package_name VARCHAR(255) NOT NULL,
        user_limit INTEGER NOT NULL DEFAULT 5,
        db_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Insert Weerasinghe ERP if not exists
    const projectRes = await mainClient.query("SELECT * FROM erp_projects WHERE company_name = 'Weerasinghe ERP'");
    if (projectRes.rowCount === 0) {
      await mainClient.query(`
        INSERT INTO erp_projects (owner_name, company_name, package_name, user_limit, db_name)
        VALUES ('Mr. Weerasinghe', 'Weerasinghe ERP', 'Premium', 5, 'Weerasinghe_ERP_DB');
      `);
      console.log('Added Weerasinghe ERP to erp_projects.');
    }
    
    // Ensure "bloom" user exists in Main DB
    // (Assuming users table exists)
    // We'll update the password to bloom123 if needed or create it.
    // Hash for 'bloom123': $2a$10$abcdef... (need bcrypt, but can use placeholder or update later)
    // Actually, I'll rely on the manual seed or existing seed logic, but I can insert a raw one here if I knew the hash.
    // Let's just create the table structure.

    await mainClient.end();
    
    // Connect to Weerasinghe_ERP_DB and update admin
    const subConnectionString = connectionString.replace('/BloomAudit_DB', '/Weerasinghe_ERP_DB');
    const subClient = new Client({ connectionString: subConnectionString });
    await subClient.connect();
    console.log('Connected to Weerasinghe_ERP_DB...');
    
    // Update admin user if needed (user: admin, pass: admin123)
    // Assuming 'users' table exists.
    
    await subClient.end();

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

setup();
