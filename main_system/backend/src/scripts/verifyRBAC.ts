
import { pool } from '../db';
// @ts-ignore
import bcrypt from 'bcryptjs';

const API_URL = 'http://127.0.0.1:3000';

async function verifyRBAC() {
  try {
    console.log('--- Starting RBAC Verification ---');

    // 1. Login as Admin
    console.log('\n1. Logging in as Admin...');
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    if (!adminLoginRes.ok) {
      throw new Error(`Admin login failed: ${adminLoginRes.statusText}`);
    }

    const adminData = await adminLoginRes.json();
    console.log('Admin Login Response:', JSON.stringify(adminData, null, 2));
    const adminToken = adminData.token || adminData.accessToken; // Check for alternative names
    console.log('Admin logged in successfully.');
    console.log('Token received:', adminToken ? adminToken.substring(0, 20) + '...' : 'undefined');

    // 2. Create a restricted user (Accountant)
    console.log('\n2. Fetching Roles...');
    const rolesRes = await fetch(`${API_URL}/rbac/roles`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const rolesData = await rolesRes.json();
    console.log('Roles Response:', JSON.stringify(rolesData, null, 2));
    const roles = rolesData.roles || rolesData; // Fallback if it returns array directly
    const accountantRole = Array.isArray(roles) ? roles.find((r: any) => r.name === 'Accountant') : null;

    if (!accountantRole) {
      throw new Error('Accountant role not found!');
    }

    const testEmail = `test_accountant_${Date.now()}@example.com`;
    console.log(`\n3. Creating restricted user: ${testEmail}...`);

    const createUserRes = await fetch(`${API_URL}/rbac/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        roleIds: [accountantRole.id]
      })
    });

    if (!createUserRes.ok) {
      const err = await createUserRes.text();
      throw new Error(`User creation failed: ${createUserRes.statusText} - ${err}`);
    }

    console.log(`User created. Setting manual password for testing...`);

    // Manually set password to 'password123'
    const testPassword = 'password123';
    const testHash = await bcrypt.hash(testPassword, 10);

    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [testHash, testEmail]);

    console.log(`Password set to '${testPassword}'`);

    // 3. Login as the new restricted user
    console.log('\n4. Logging in as Restricted User...');
    const userLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    if (!userLoginRes.ok) {
      throw new Error(`Restricted user login failed: ${userLoginRes.statusText}`);
    }

    const userLoginData = await userLoginRes.json();
    const userToken = userLoginData.token || userLoginData.accessToken;
    const userPermissions = userLoginData.user.permissions;
    console.log('Restricted User logged in.');
    console.log('User Token:', userToken ? userToken.substring(0, 20) + '...' : 'undefined');
    console.log('Permissions:', userPermissions);

    // Verify expected permissions
    const expected = ['accounts:read', 'accounts:create'];
    const hasExpected = expected.every(p => userPermissions.includes(p));
    const hasUnexpected = userPermissions.includes('employees:read');

    if (hasExpected && !hasUnexpected) {
      console.log('SUCCESS: User has correct accounting permissions and NO employee permissions.');
    } else {
      console.error('FAILURE: Permission mismatch.');
      console.log('Expected (subset):', expected);
      console.log('Has Employee Read (should be false):', hasUnexpected);
    }

    // 4. Test Restricted Endpoint
    console.log('\n5. Testing Restricted Endpoint (Employees)...');
    const restrictedRes = await fetch(`${API_URL}/employees`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (restrictedRes.status === 403) {
      console.log('SUCCESS: Access to /employees denied (403 Forbidden).');
    } else {
      console.error(`FAILURE: Unexpected status for restricted endpoint: ${restrictedRes.status}`);
      const errorBody = await restrictedRes.text();
      console.log('Error Body:', errorBody);

      if (restrictedRes.status === 401) console.log("Note: 401 means Unauthorized (token invalid/missing).");
    }

    // 5. Test Allowed Endpoint
    console.log('\n6. Testing Allowed Endpoint (Accounts)...');
    const allowedRes = await fetch(`${API_URL}/accounts`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (allowedRes.ok) {
      console.log('SUCCESS: Access to /accounts granted.');
    } else {
      console.error(`FAILURE: Access to /accounts denied: ${allowedRes.status}`);
    }

    // 6. Test Another Restricted Endpoint (Projects)
    console.log('\n7. Testing Restricted Endpoint (Projects)...');
    const restrictedProjectsRes = await fetch(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (restrictedProjectsRes.status === 403) {
      console.log('SUCCESS: Access to /projects denied (403 Forbidden).');
    } else {
      console.error(`FAILURE: Unexpected status for projects endpoint: ${restrictedProjectsRes.status}`);
    }

    // 7. Test Another Allowed Endpoint (Vendors)
    console.log('\n8. Testing Allowed Endpoint (Vendors)...');
    const allowedVendorsRes = await fetch(`${API_URL}/vendors`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (allowedVendorsRes.ok) {
      console.log('SUCCESS: Access to /vendors granted.');
    } else {
      console.error(`FAILURE: Access to /vendors denied: ${allowedVendorsRes.status}`);
    }

    // Cleanup
    console.log('\n9. Cleaning up test user...');
    await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
    console.log('Test user deleted.');

  } catch (error: any) {
    console.error('Test Failed:', error.message);
  } finally {
    await pool.end();
  }
}

verifyRBAC();
