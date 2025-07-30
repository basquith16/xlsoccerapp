import dotenv from 'dotenv';
import { paymentProviderService } from './src/services/PaymentProviderService';
import { PaymentProviderType } from './src/interfaces/PaymentProvider';

// Load environment variables
dotenv.config({ path: './config.env' });

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  error?: any;
}

const results: TestResult[] = [];

function log(test: string, status: 'PASS' | 'FAIL', message: string, error?: any) {
  results.push({ test, status, message, error });
  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} ${test}: ${message}`);
  if (error) {
    console.log(`   Error: ${error.message || error}`);
  }
}

async function testPaymentProviders() {
  console.log('🧪 Starting Comprehensive Payment Provider Tests\n');

  // Test 1: Environment Variables
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const squareToken = process.env.SQUARE_ACCESS_TOKEN;
    const squareAppId = process.env.SQUARE_APPLICATION_ID;

    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY missing');
    if (!squareToken) throw new Error('SQUARE_ACCESS_TOKEN missing');
    if (!squareAppId) throw new Error('SQUARE_APPLICATION_ID missing');

    log('Environment Variables', 'PASS', 'All required API keys configured');
  } catch (error) {
    log('Environment Variables', 'FAIL', 'Missing required environment variables', error);
  }

  // Test 2: Payment Provider Service Initialization
  try {
    const availableProviders = paymentProviderService.getAvailableProviders();
    if (availableProviders.length !== 2) {
      throw new Error(`Expected 2 providers, found ${availableProviders.length}`);
    }
    
    const stripeConfig = paymentProviderService.getProviderConfig(PaymentProviderType.STRIPE);
    const squareConfig = paymentProviderService.getProviderConfig(PaymentProviderType.SQUARE);
    
    if (!stripeConfig || !squareConfig) {
      throw new Error('Provider configurations not found');
    }

    log('Provider Service Init', 'PASS', `Found ${availableProviders.length} providers configured`);
  } catch (error) {
    log('Provider Service Init', 'FAIL', 'Failed to initialize payment provider service', error);
  }

  // Test 3: Stripe Provider Loading
  try {
    const stripeProvider = await paymentProviderService.getProvider(PaymentProviderType.STRIPE);
    if (stripeProvider.name !== 'stripe') {
      throw new Error(`Expected 'stripe', got '${stripeProvider.name}'`);
    }
    if (stripeProvider.displayName !== 'Stripe') {
      throw new Error(`Expected 'Stripe', got '${stripeProvider.displayName}'`);
    }

    log('Stripe Provider Loading', 'PASS', 'Stripe provider loaded successfully');
  } catch (error) {
    log('Stripe Provider Loading', 'FAIL', 'Failed to load Stripe provider', error);
  }

  // Test 4: Activate Square Provider (by design, Square starts inactive)
  try {
    paymentProviderService.updateProviderConfig(PaymentProviderType.SQUARE, {
      isActive: true,
    });
    log('Square Provider Activation', 'PASS', 'Square provider activated successfully');
  } catch (error) {
    log('Square Provider Activation', 'FAIL', 'Failed to activate Square provider', error);
  }

  // Test 5: Square Provider Loading
  try {
    const squareProvider = await paymentProviderService.getProvider(PaymentProviderType.SQUARE);
    if (squareProvider.name !== 'square') {
      throw new Error(`Expected 'square', got '${squareProvider.name}'`);
    }
    if (squareProvider.displayName !== 'Square') {
      throw new Error(`Expected 'Square', got '${squareProvider.displayName}'`);
    }

    log('Square Provider Loading', 'PASS', 'Square provider loaded successfully');
  } catch (error) {
    log('Square Provider Loading', 'FAIL', 'Failed to load Square provider', error);
  }

  // Test 6: Stripe API Connection
  try {
    const stripeProvider = await paymentProviderService.getProvider(PaymentProviderType.STRIPE);
    
    // Test customer creation
    const testCustomer = await stripeProvider.getOrCreateCustomer(
      'test-user-123',
      'test@example.com',
      'Test User'
    );
    
    if (!testCustomer.id || !testCustomer.email) {
      throw new Error('Invalid customer response from Stripe');
    }

    log('Stripe API Connection', 'PASS', `Created/retrieved customer: ${testCustomer.id}`);
  } catch (error) {
    log('Stripe API Connection', 'FAIL', 'Failed to connect to Stripe API', error);
  }

  // Test 7: Square API Connection
  try {
    const squareProvider = await paymentProviderService.getProvider(PaymentProviderType.SQUARE);
    
    // Test customer creation
    const testCustomer = await squareProvider.getOrCreateCustomer(
      'test-user-456',
      'squaretest@example.com',
      'Square Test User'
    );
    
    if (!testCustomer.id || !testCustomer.email) {
      throw new Error('Invalid customer response from Square');
    }

    log('Square API Connection', 'PASS', `Created/retrieved customer: ${testCustomer.id}`);
  } catch (error) {
    log('Square API Connection', 'FAIL', 'Failed to connect to Square API', error);
  }

  // Test 8: Payment Intent Creation - Stripe
  try {
    const stripeProvider = await paymentProviderService.getProvider(PaymentProviderType.STRIPE);
    
    const paymentIntent = await stripeProvider.createPaymentIntent({
      amount: 5000, // $50.00
      currency: 'usd',
      customerEmail: 'test@example.com',
      description: 'Test payment intent',
      metadata: { test: 'true' }
    });
    
    if (!paymentIntent.id || !paymentIntent.clientSecret || paymentIntent.amount !== 5000) {
      throw new Error('Invalid payment intent response from Stripe');
    }

    log('Stripe Payment Intent', 'PASS', `Created payment intent: ${paymentIntent.id}`);
  } catch (error) {
    log('Stripe Payment Intent', 'FAIL', 'Failed to create Stripe payment intent', error);
  }

  // Test 9: Payment Intent Creation - Square
  try {
    const squareProvider = await paymentProviderService.getProvider(PaymentProviderType.SQUARE);
    
    const paymentIntent = await squareProvider.createPaymentIntent({
      amount: 3000, // $30.00
      currency: 'usd',
      customerEmail: 'squaretest@example.com',
      description: 'Test Square payment intent',
      metadata: { test: 'true', provider: 'square' }
    });
    
    if (!paymentIntent.id || !paymentIntent.clientSecret || paymentIntent.amount !== 3000) {
      throw new Error('Invalid payment intent response from Square');
    }

    log('Square Payment Intent', 'PASS', `Created payment intent: ${paymentIntent.id}`);
  } catch (error) {
    log('Square Payment Intent', 'FAIL', 'Failed to create Square payment intent', error);
  }

  // Test 10: Provider Switching
  try {
    // Start with default (should be Stripe)
    const defaultProvider = await paymentProviderService.getDefaultProvider();
    if (defaultProvider.name !== 'stripe') {
      throw new Error(`Expected default to be stripe, got ${defaultProvider.name}`);
    }

    // Switch to Square
    await paymentProviderService.setActiveProvider(PaymentProviderType.SQUARE);
    const activeProvider = await paymentProviderService.getActiveProvider();
    if (activeProvider.name !== 'square') {
      throw new Error(`Expected active to be square after switch, got ${activeProvider.name}`);
    }

    // Switch back to Stripe
    await paymentProviderService.setActiveProvider(PaymentProviderType.STRIPE);
    const backToStripe = await paymentProviderService.getActiveProvider();
    if (backToStripe.name !== 'stripe') {
      throw new Error(`Expected active to be stripe after switch back, got ${backToStripe.name}`);
    }

    log('Provider Switching', 'PASS', 'Successfully switched between providers');
  } catch (error) {
    log('Provider Switching', 'FAIL', 'Failed to switch providers', error);
  }

  // Test 10: Provider Availability Checks
  try {
    const stripeAvailable = await paymentProviderService.isProviderAvailable(PaymentProviderType.STRIPE);
    const squareAvailable = await paymentProviderService.isProviderAvailable(PaymentProviderType.SQUARE);

    if (!stripeAvailable) {
      throw new Error('Stripe should be available');
    }
    if (!squareAvailable) {
      throw new Error('Square should be available');
    }

    log('Provider Availability', 'PASS', 'Both providers are available');
  } catch (error) {
    log('Provider Availability', 'FAIL', 'Provider availability check failed', error);
  }

  // Test Summary
  console.log('\n📊 Test Summary:');
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const totalCount = results.length;

  console.log(`✅ Passed: ${passCount}/${totalCount}`);
  console.log(`❌ Failed: ${failCount}/${totalCount}`);
  
  if (failCount > 0) {
    console.log('\n🚨 Failed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   • ${r.test}: ${r.message}`);
    });
  }

  const overallStatus = failCount === 0 ? 'PASS' : 'FAIL';
  console.log(`\n🎯 Overall Status: ${overallStatus}`);
  
  return overallStatus === 'PASS';
}

// Run tests
testPaymentProviders()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
  });