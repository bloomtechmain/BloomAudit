
import { Pool } from 'pg';
import 'dotenv/config';

const run = async () => {
  console.log('Testing connection to Weerasinghe_ERP_DB...');
  
  const baseUrl = process.env.DATABASE_URL || '';
  const clientDbUrl = baseUrl.replace(/\/[^/]+$/, '/Weerasinghe_ERP_DB');
  
  console.log('Target URL:', clientDbUrl);

  const pool = new Pool({ connectionString: clientDbUrl });
  
  try {
    const res = await pool.query('SELECT id, name, email FROM users');
    console.log('Users found:', res.rows);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await pool.end();
  }
};

run();
