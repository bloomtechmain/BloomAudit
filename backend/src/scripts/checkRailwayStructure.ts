import { pool } from '../db'

async function checkStructure() {
  try {
    console.log('Checking Railway database structure...\n')
    
    // Get all tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    
    console.log('All tables:')
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`))
    
    console.log('\n---\n')
    
    // Check projects table structure
    const projectsCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      ORDER BY ordinal_position
    `)
    
    console.log('PROJECTS table columns:')
    projectsCols.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`)
    })
    
    console.log('\n---\n')
    
    // Check if contracts table exists
    const contractsExists = tables.rows.some(r => r.table_name === 'contracts')
    
    if (contractsExists) {
      const contractsCols = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'contracts' 
        ORDER BY ordinal_position
      `)
      
      console.log('CONTRACTS table columns:')
      contractsCols.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`)
      })
    } else {
      console.log('⚠️  CONTRACTS table does NOT exist!')
    }
    
    console.log('\n---\n')
    
    // Count records
    const projectsCount = await pool.query('SELECT COUNT(*) FROM projects')
    console.log(`Projects count: ${projectsCount.rows[0].count}`)
    
    if (contractsExists) {
      const contractsCount = await pool.query('SELECT COUNT(*) FROM contracts')
      console.log(`Contracts count: ${contractsCount.rows[0].count}`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await pool.end()
  }
}

checkStructure()
