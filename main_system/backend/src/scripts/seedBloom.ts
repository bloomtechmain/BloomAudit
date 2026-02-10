
import bcrypt from 'bcryptjs'
import { pool } from '../db'

async function main() {
  const name = 'bloom'
  const email = 'bloom' // Username used as email for login
  const password = 'bloom123'
  const role = 'admin'
  const hash = await bcrypt.hash(password, 10)

  // Check if exists
  const check = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  if (check.rows.length > 0) {
    console.log('Bloom user already exists. Updating password...')
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email])
    const userId = check.rows[0].id
    // Ensure Super Admin role
    const roleRes = await pool.query("SELECT id FROM roles WHERE name = 'Super Admin'")
    if (roleRes.rows.length > 0) {
      await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, roleRes.rows[0].id])
    }
  } else {
    console.log('Creating Bloom user...')
    const res = await pool.query(
      `INSERT INTO users(name,email,password_hash,role)
       VALUES($1,$2,$3,$4) RETURNING id`,
      [name, email, hash, role]
    )
    const userId = res.rows[0].id
    // Assign Super Admin role
    const roleRes = await pool.query("SELECT id FROM roles WHERE name = 'Super Admin'")
    if (roleRes.rows.length > 0) {
      await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, roleRes.rows[0].id])
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => pool.end())
