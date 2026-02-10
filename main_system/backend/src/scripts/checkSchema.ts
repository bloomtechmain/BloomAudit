import { pool } from '../db'

async function checkSchema() {
  try {
    console.log('Checking current projects table schema...\n')
    
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      ORDER BY ordinal_position
    `)
    
    console.log('Current projects table columns:')
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`)
    })
    
    console.log('\n---\n')
    
    // Also check project_items
    const itemsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'project_items' 
      ORDER BY ordinal_position
    `)
    
    console.log('Current project_items table columns:')
    itemsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`)
    })
    
  } catch (error) {
    console.error('Error checking schema:', error)
    throw error
  } finally {
    await pool.end()
  }
}

checkSchema()
