
import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const mainDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:Tharusha%4012345@localhost:5432/BloomAudit_DB'
const subDbUrl = 'postgresql://postgres:Tharusha%4012345@localhost:5432/Weerasinghe_ERP_DB'

async function verify() {
  console.log('🔍 Starting Verification...')

  // 1. Verify Main System Data
  const mainClient = new Client({ connectionString: mainDbUrl })
  try {
    await mainClient.connect()
    console.log('✅ Connected to Main System DB (BloomAudit_DB)')

    const res = await mainClient.query("SELECT * FROM erp_projects WHERE company_name = 'Weerasinghe ERP'")
    if (res.rows.length > 0) {
      console.log(`✅ Found 'Weerasinghe ERP' in erp_projects. User Limit: ${res.rows[0].user_limit}`)
    } else {
      console.error("❌ 'Weerasinghe ERP' NOT found in erp_projects!")
    }
  } catch (e) {
    console.error('❌ Failed to connect/query Main System DB', e)
  } finally {
    await mainClient.end()
  }

  // 2. Verify Sub System Data
  const subClient = new Client({ connectionString: subDbUrl })
  try {
    await subClient.connect()
    console.log('✅ Connected to Sub System DB (Weerasinghe_ERP_DB)')

    const res = await subClient.query('SELECT COUNT(*) FROM users')
    console.log(`✅ Current Users in Weerasinghe ERP: ${res.rows[0].count}`)
  } catch (e) {
    console.error('❌ Failed to connect/query Sub System DB', e)
  } finally {
    await subClient.end()
  }

  console.log('🏁 Verification Complete.')
}

verify()
