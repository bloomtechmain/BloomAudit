import { pool } from '../db'

/**
 * Fix Railway database structure:
 * - Recreate projects table with correct top-level structure
 * - Rename project_items to contract_items
 * - Update foreign keys
 */

async function fixRailwayStructure() {
  try {
    console.log('Starting Railway database structure fix...\n')
    
    await pool.query('BEGIN')
    
    // Step 1: Drop the old projects table (it has wrong structure and is empty)
    console.log('Step 1: Dropping old projects table...')
    await pool.query('DROP TABLE IF EXISTS projects CASCADE')
    console.log('✅ Old projects table dropped')
    
    // Step 2: Create new projects table with correct top-level structure
    console.log('\nStep 2: Creating new projects table with correct structure...')
    await pool.query(`
      CREATE TABLE projects (
        project_id SERIAL PRIMARY KEY,
        project_name VARCHAR(200) NOT NULL,
        project_description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ New projects table created')
    
    // Step 3: Fix contracts table foreign key
    console.log('\nStep 3: Updating contracts table foreign key...')
    await pool.query(`
      ALTER TABLE contracts
      DROP CONSTRAINT IF EXISTS contracts_project_id_fkey
    `)
    await pool.query(`
      ALTER TABLE contracts
      ADD CONSTRAINT contracts_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
    `)
    console.log('✅ Contracts foreign key updated')
    
    // Step 4: Check if project_items exists and rename to contract_items
    console.log('\nStep 4: Checking project_items table...')
    const checkProjectItems = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'project_items'
    `)
    
    if (checkProjectItems.rows.length > 0) {
      console.log('  Found project_items - renaming to contract_items...')
      
      // Rename table
      await pool.query('ALTER TABLE project_items RENAME TO contract_items')
      
      // Rename column
      await pool.query('ALTER TABLE contract_items RENAME COLUMN project_id TO contract_id')
      
      // Drop old foreign key if exists
      await pool.query(`
        ALTER TABLE contract_items
        DROP CONSTRAINT IF EXISTS project_items_project_id_fkey
      `)
      
      // Add new foreign key
      await pool.query(`
        ALTER TABLE contract_items
        ADD CONSTRAINT contract_items_contract_id_fkey
        FOREIGN KEY (contract_id) REFERENCES contracts(contract_id) ON DELETE CASCADE
      `)
      
      console.log('✅ project_items renamed to contract_items')
    } else {
      console.log('  project_items not found - checking if contract_items already exists...')
      const checkContractItems = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'contract_items'
      `)
      if (checkContractItems.rows.length > 0) {
        console.log('✅ contract_items already exists')
      } else {
        console.log('⚠️  Neither table found - may need to create contract_items')
      }
    }
    
    // Step 5: Create sample projects for testing
    console.log('\nStep 5: Creating sample projects...')
    await pool.query(`
      INSERT INTO projects (project_name, project_description, status)
      VALUES 
        ('Bloom Swift POS', 'Point of Sale System Development', 'active'),
        ('Bloom Audit', 'Audit Management System', 'active')
    `)
    console.log('✅ Sample projects created')
    
    await pool.query('COMMIT')
    
    console.log('\n=== Verification ===\n')
    
    // Verify structure
    const projectsCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      ORDER BY ordinal_position
    `)
    
    console.log('New PROJECTS table structure:')
    projectsCols.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`)
    })
    
    const projectsCount = await pool.query('SELECT COUNT(*) FROM projects')
    console.log(`\nProjects count: ${projectsCount.rows[0].count}`)
    
    console.log('\n✅ Railway database structure fix completed successfully!')
    console.log('\n🚀 Your projects page should now load correctly!')
    
  } catch (error) {
    await pool.query('ROLLBACK')
    console.error('❌ Fix failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

fixRailwayStructure()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
