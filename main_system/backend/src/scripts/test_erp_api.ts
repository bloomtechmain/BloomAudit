
import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function test() {
  try {
    // 1. Login to get token
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'bloom',
      password: 'bloom123'
    });
    
    const token = loginRes.data.accessToken;
    console.log('Login successful. Token obtained.');

    // 2. Fetch ERP Projects
    const res = await axios.get(`${API_URL}/erp-projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('ERP Projects Response Status:', res.status);
    console.log('ERP Projects Data:', JSON.stringify(res.data, null, 2));

    if (Array.isArray(res.data)) {
      console.log('SUCCESS: Data is an array.');
    } else {
      console.error('FAILURE: Data is NOT an array.');
    }

  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
  }
}

test();
