import { pool } from '../db'

async function checkTables() {
  try {
    console.log('Checking database structure...\n')
    
    // Check which tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    
    console.log('Existing tables:')
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })
    
    console.log('\n---\n')
    
    // Check if contracts table exists
    const contractsExists = tablesResult.rows.some(r => r.table_name === 'contracts')
    
    if (contractsExists) {
      console.log('✅ Contracts table already exists!')
      
      const contractsSchema = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'contracts' 
        ORDER BY ordinal_position
      `)
      
      console.log('\nContracts table columns:')
      contractsSchema.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`)
      })
      
      // Check contract_items
      const contractItemsExists = tablesResult.rows.some(r => r.table_name === 'contract_items')
      if (contractItemsExists) {
        console.log('\n✅ Contract_items table already exists!')
        
        const contractItemsSchema = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'contract_items' 
          ORDER BY ordinal_position
        `)
        
        console.log('\nContract_items table columns:')
        contractItemsSchema.rows.forEach(row => {
          console.log(`  - ${row.column_name} (${row.data_type})`)
        })
      }
    } else {
      console.log('⚠️  Contracts table does not exist yet - migration needed')
    }
    
  } catch (error) {
    console.error('Error checking tables:', error)
    throw error
  } finally {
    await pool.end()
  }
}

checkTables()
