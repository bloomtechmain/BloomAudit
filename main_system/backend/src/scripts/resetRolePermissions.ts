
import { pool } from '../db';

async function main() {
    console.log('Resetting role permissions...');
    // Delete all role_permissions
    // await pool.query('DELETE FROM role_permissions'); // Too aggressive?

    // Better: Delete permissions for specific roles we are redefining
    const roles = ['Accountant', 'Project Manager', 'Viewer', 'Admin'];
    for (const roleName of roles) {
        console.log(`Clearing permissions for ${roleName}...`);
        await pool.query(`
            DELETE FROM role_permissions 
            WHERE role_id IN (SELECT id FROM roles WHERE name = $1)
        `, [roleName]);
    }
    console.log('Done.');
}

main().finally(() => pool.end());
