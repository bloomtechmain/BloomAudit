import { pool } from '../db'

/**
 * Hotfix: Rename projects_name to project_name in Railway database
 * This fixes the 500 error on the projects page
 */

async function fixColumnName() {
  try {
    console.log('Starting hotfix: Renaming projects_name → project_name...\n')
    
    await pool.query('BEGIN')
    
    // Check if the old column exists
    const checkOldColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'projects' AND column_name = 'projects_name'
    `)
    
    if (checkOldColumn.rows.length > 0) {
      console.log('✅ Found projects_name column - renaming to project_name...')
      
      // Rename the column
      await pool.query(`
        ALTER TABLE projects 
        RENAME COLUMN projects_name TO project_name;
      `)
      
      console.log('✅ Column renamed successfully!')
    } else {
      // Check if correct column already exists
      const checkNewColumn = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'project_name'
      `)
      
      if (checkNewColumn.rows.length > 0) {
        console.log('✅ Column project_name already exists - no fix needed!')
      } else {
        console.log('⚠️  Neither projects_name nor project_name found - unexpected state!')
      }
    }
    
    await pool.query('COMMIT')
    
    console.log('\n--- Verification ---')
    
    // Verify the fix
    const verifyColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      ORDER BY ordinal_position
    `)
    
    console.log('\nCurrent projects table columns:')
    verifyColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`)
    })
    
    console.log('\n✅ Hotfix completed successfully!')
    
  } catch (error) {
    await pool.query('ROLLBACK')
    console.error('❌ Hotfix failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

fixColumnName()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
