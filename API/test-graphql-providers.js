import fetch from 'node-fetch';

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

async function testProviderQueries() {
  console.log('🧪 Testing Payment Provider GraphQL API\n');

  // Test 1: Query billing configuration
  const billingConfigQuery = `
    query {
      billingConfiguration {
        activeProvider
        providers {
          type
          name
          displayName
          isActive
          isDefault
          isConnected
        }
        stripe {
          isConnected
          accountId
          defaultCurrency
        }
        square {
          isConnected
          accountId
          environment
        }
      }
    }
  `;

  try {
    console.log('📊 Testing billingConfiguration query...');
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: billingConfigQuery,
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      console.log('❌ GraphQL Errors:', result.errors);
    } else {
      console.log('✅ Billing Configuration:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }

  // Test 2: Query payment providers
  const providersQuery = `
    query {
      paymentProviders {
        type
        name
        displayName
        isActive
        isDefault
        isConnected
        config {
          publicKey
          environment
        }
      }
    }
  `;

  try {
    console.log('\n💳 Testing paymentProviders query...');
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: providersQuery,
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      console.log('❌ GraphQL Errors:', result.errors);
    } else {
      console.log('✅ Payment Providers:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }

  // Test 3: Test provider connection
  const testConnectionMutation = `
    mutation {
      testPaymentProviderConnection(providerType: "stripe") {
        success
        message
        connectionStatus
        responseTime
      }
    }
  `;

  try {
    console.log('\n🔌 Testing payment provider connection...');
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: testConnectionMutation,
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      console.log('❌ GraphQL Errors:', result.errors);
    } else {
      console.log('✅ Connection Test:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

// Run the test
testProviderQueries().then(() => {
  console.log('\n🎯 GraphQL API test completed!');
}).catch(error => {
  console.error('💥 Test failed:', error);
});