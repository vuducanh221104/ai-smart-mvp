// Test script for stats API
const BASE_URL = 'http://localhost:3000';

async function testStatsAPI() {
  console.log('🧪 Testing Stats API...\n');

  try {
    // Test GET stats
    console.log('1. Testing GET /api/stats...');
    const getResponse = await fetch(`${BASE_URL}/api/stats`);
    const getData = await getResponse.json();
    console.log('✅ GET Response:', getData);

    // Test POST stats (increment)
    console.log('\n2. Testing POST /api/stats...');
    const postResponse = await fetch(`${BASE_URL}/api/stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileSize: 1024 * 1024 // 1MB
      })
    });
    const postData = await postResponse.json();
    console.log('✅ POST Response:', postData);

    // Test GET stats again to see if it increased
    console.log('\n3. Testing GET /api/stats again...');
    const getResponse2 = await fetch(`${BASE_URL}/api/stats`);
    const getData2 = await getResponse2.json();
    console.log('✅ GET Response (after increment):', getData2);

    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Error testing stats API:', error);
  }
}

// Run the test
testStatsAPI();
