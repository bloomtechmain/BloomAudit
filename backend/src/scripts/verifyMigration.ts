import { pool } from '../db'

async function verifyMigration() {
  try {
    console.log('Verifying migration status...\n')
    
    // Check projects
    const projectsResult = await pool.query('SELECT COUNT(*) as count FROM projects')
    console.log(`📊 Projects: ${projectsResult.rows[0].count} found`)
    
    if (parseInt(projectsResult.rows[0].count) > 0) {
      const sampleProjects = await pool.query('SELECT project_id, project_name FROM projects LIMIT 5')
      console.log('   Sample projects:')
      sampleProjects.rows.forEach(p => {
        console.log(`     - [${p.project_id}] ${p.project_name}`)
      })
    }
    
    console.log('')
    
    // Check contracts
    const contractsResult = await pool.query('SELECT COUNT(*) as count FROM contracts')
    console.log(`📋 Contracts: ${contractsResult.rows[0].count} found`)
    
    if (parseInt(contractsResult.rows[0].count) > 0) {
      const sampleContracts = await pool.query(`
        SELECT c.contract_id, c.contract_name, c.project_id, p.project_name 
        FROM contracts c
        LEFT JOIN projects p ON c.project_id = p.project_id
        LIMIT 5
      `)
      console.log('   Sample contracts:')
      sampleContracts.rows.forEach(c => {
        console.log(`     - [${c.contract_id}] ${c.contract_name} → Project: ${c.project_name || 'N/A'}`)
      })
    }
    
    console.log('')
    
    // Check contract_items
    const itemsResult = await pool.query('SELECT COUNT(*) as count FROM contract_items')
    console.log(`📦 Contract Items: ${itemsResult.rows[0].count} found`)
    
    console.log('\n---\n')
    
    // Check foreign key relationships
    console.log('🔗 Checking foreign key relationships...\n')
    
    const fkResult = await pool.query(`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name IN ('contracts', 'contract_items', 'payables', 'receivables'))
      ORDER BY tc.table_name
    `)
    
    const relevantFKs = fkResult.rows.filter(fk => 
      (fk.table_name === 'contracts' && fk.column_name === 'project_id') ||
      (fk.table_name === 'contract_items' && fk.column_name === 'contract_id') ||
      (fk.table_name === 'payables' && fk.column_name === 'contract_id') ||
      (fk.table_name === 'receivables' && fk.column_name === 'contract_id')
    )
    
    relevantFKs.forEach(fk => {
      console.log(`   ✅ ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`)
    })
    
    console.log('\n---\n')
    
    // Check payables and receivables
    const payablesCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payables' AND column_name IN ('project_id', 'contract_id')
    `)
    
    const receivablesCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'receivables' AND column_name IN ('project_id', 'contract_id')
    `)
    
    console.log('💰 Payables/Receivables reference columns:')
    console.log(`   Payables: ${payablesCheck.rows.map(r => r.column_name).join(', ') || 'none'}`)
    console.log(`   Receivables: ${receivablesCheck.rows.map(r => r.column_name).join(', ') || 'none'}`)
    
    console.log('\n✅ Migration verification complete!')
    
  } catch (error) {
    console.error('Error verifying migration:', error)
    throw error
  } finally {
    await pool.end()
  }
}

verifyMigration()
