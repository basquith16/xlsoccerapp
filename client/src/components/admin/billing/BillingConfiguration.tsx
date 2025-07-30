import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  CreditCard, 
  Globe,
  Shield,
  Bell,
  Mail,
  Key,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Square,
  Loader
} from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import {
  GET_BILLING_CONFIGURATION,
  GET_PAYMENT_PROVIDERS,
  SET_ACTIVE_PAYMENT_PROVIDER,
  UPDATE_PAYMENT_PROVIDER_CONFIG,
  TEST_PAYMENT_PROVIDER_CONNECTION,
  UPDATE_BILLING_CONFIGURATION
} from '../../../graphql/queries/adminBilling';

const BillingConfiguration: React.FC = () => {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [activeProvider, setActiveProvider] = useState('stripe');
  const [testing, setTesting] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [settings, setSettings] = useState({
    // Payment Provider Selection
    activeProvider: 'stripe',
    
    // Stripe Configuration
    stripePublishableKey: 'pk_test_51NctyzC5wZsDYstk...',
    stripeSecretKey: 'sk_test_51NctyzC5wZsDYstk...',
    stripeWebhookSecret: 'whsec_1234567890...',
    stripeConnected: false, // Will be updated from GraphQL response
    
    // Square Configuration
    squareApplicationId: 'sandbox-sq0idb-39WP33sDzVvlbIqNpoyDOA',
    squareAccessToken: 'EAAAl3I1vq7MCrIDheqAocX2T_-6Aim6kdltvqLRSkqEGelFMT2t0oABtVgjdcld',
    squareWebhookSecret: 'your_webhook_signature_key_here',
    squareConnected: false, // Will be updated from GraphQL response
    
    // Payment Settings
    currency: 'USD',
    paymentMethods: {
      cards: true,
      applePay: true,
      googlePay: true,
      bankTransfer: false
    },
    
    // Pricing & Fees
    processingFee: 2.9,
    fixedFee: 0.30,
    taxRate: 8.5,
    
    // Policies
    refundPolicy: 'flexible',
    refundWindow: 24,
    latePaymentFee: 5.00,
    
    // Notifications
    emailNotifications: {
      paymentSuccess: true,
      paymentFailed: true,
      refundProcessed: true,
      disputeCreated: true
    },
    
    // Security
    requireCVV: true,
    enable3DSecure: true,
    fraudDetection: true,
    
    // Invoicing
    invoicePrefix: 'INV-',
    invoiceNumbering: 'sequential',
    autoSendInvoices: true,
    
    // Reporting
    defaultCurrency: 'USD',
    reportingTimezone: 'America/New_York'
  });

  // GraphQL queries and mutations
  const { data: billingConfig, loading: configLoading, refetch: refetchConfig } = useQuery(GET_BILLING_CONFIGURATION);
  const { data: providersData, loading: providersLoading } = useQuery(GET_PAYMENT_PROVIDERS);
  
  const [setActiveProviderMutation] = useMutation(SET_ACTIVE_PAYMENT_PROVIDER);
  const [updateProviderConfigMutation] = useMutation(UPDATE_PAYMENT_PROVIDER_CONFIG);
  const [testConnectionMutation] = useMutation(TEST_PAYMENT_PROVIDER_CONNECTION);
  const [updateBillingConfigMutation] = useMutation(UPDATE_BILLING_CONFIGURATION);

  // Update local state when data loads
  useEffect(() => {
    if (billingConfig?.billingConfiguration) {
      const config = billingConfig.billingConfiguration;
      setActiveProvider(config.activeProvider || 'stripe');
      
      // Find provider-specific connection status
      const stripeProvider = config.providers?.find(p => p.type === 'stripe' || p.name === 'stripe');
      const squareProvider = config.providers?.find(p => p.type === 'square' || p.name === 'square');
      
      // Debug logging
      console.log('🔍 Billing Config Data:', {
        activeProvider: config.activeProvider,
        stripeProvider: stripeProvider,
        squareProvider: squareProvider,
        stripeConfig: config.stripe,
        squareConfig: config.square
      });
      
      // Update settings with server data
      setSettings(prev => ({
        ...prev,
        activeProvider: config.activeProvider || 'stripe',
        // Only show as connected if the provider is active AND has credentials
        stripeConnected: stripeProvider?.isConnected && stripeProvider?.isActive,
        squareConnected: squareProvider?.isConnected && squareProvider?.isActive,
        // Map other configuration values as needed
        paymentMethods: config.paymentMethods || prev.paymentMethods,
        processingFee: config.fees?.processingFeePercentage || prev.processingFee,
        fixedFee: config.fees?.fixedFeeAmount || prev.fixedFee,
        taxRate: config.fees?.taxRate || prev.taxRate,
      }));
    }
  }, [billingConfig]);

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev] as any,
        [key]: value
      }
    }));
  };

  const handleSimpleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      // Clean the data to remove Apollo's __typename fields
      const cleanPaymentMethods = {
        cards: settings.paymentMethods.cards,
        applePay: settings.paymentMethods.applePay,
        googlePay: settings.paymentMethods.googlePay,
        bankTransfer: settings.paymentMethods.bankTransfer,
      };

      const cleanEmailNotifications = {
        paymentSuccess: settings.emailNotifications.paymentSuccess,
        paymentFailed: settings.emailNotifications.paymentFailed,
        refundProcessed: settings.emailNotifications.refundProcessed,
        disputeCreated: settings.emailNotifications.disputeCreated,
      };

      const { data } = await updateBillingConfigMutation({
        variables: {
          input: {
            activeProvider: settings.activeProvider,
            paymentMethods: cleanPaymentMethods,
            fees: {
              processingFeePercentage: settings.processingFee,
              fixedFeeAmount: settings.fixedFee,
              taxRate: settings.taxRate,
            },
            policies: {
              refundPolicy: settings.refundPolicy,
              refundWindowHours: settings.refundWindow,
              latePaymentFee: settings.latePaymentFee,
            },
            notifications: cleanEmailNotifications,
            security: {
              requireCVV: settings.requireCVV,
              enable3DSecure: settings.enable3DSecure,
              fraudDetection: settings.fraudDetection,
            },
          },
        },
      });
      
      if (data?.updateBillingConfiguration?.success) {
        console.log('✅ Billing settings saved successfully');
        setSaveStatus('success');
        refetchConfig();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('❌ Error saving billing settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const testConnection = async (provider: string) => {
    setTesting(provider);
    try {
      const { data } = await testConnectionMutation({
        variables: { providerType: provider },
      });
      
      if (data?.testPaymentProviderConnection?.success) {
        console.log(`✅ ${provider} connection test successful`);
      } else {
        console.log(`❌ ${provider} connection test failed: ${data?.testPaymentProviderConnection?.message}`);
      }
    } catch (error) {
      console.error(`❌ Error testing ${provider} connection:`, error);
    } finally {
      setTesting(null);
    }
  };

  const switchProvider = async (provider: string) => {
    try {
      const { data } = await setActiveProviderMutation({
        variables: { providerType: provider },
      });
      
      if (data?.setActivePaymentProvider?.success) {
        setActiveProvider(provider);
        handleSimpleSettingChange('activeProvider', provider);
        console.log(`✅ Switched to ${provider} provider`);
        
        // Refetch both queries to get updated provider status
        await refetchConfig();
        
        // Update local state immediately for better UX
        setSettings(prev => ({
          ...prev,
          activeProvider: provider
        }));
      } else {
        console.error(`❌ Failed to switch to ${provider}: ${data?.setActivePaymentProvider?.message}`);
      }
    } catch (error) {
      console.error(`❌ Error switching to ${provider}:`, error);
    }
  };

  // Show loading state while fetching configuration
  if (configLoading || providersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Billing Configuration</h3>
            <p className="text-sm text-gray-600">Configure payment processing and billing settings</p>
          </div>
        </div>
        <Card>
          <div className="p-6 flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin mr-2" />
            <span className="text-gray-600">Loading payment provider configuration...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Billing Configuration</h3>
          <p className="text-sm text-gray-600">Configure payment processing and billing settings</p>
        </div>
        <Button
          onClick={saveSettings}
          disabled={saveStatus === 'saving'}
          className={`${
            saveStatus === 'success' 
              ? 'bg-green-600 hover:bg-green-700' 
              : saveStatus === 'error'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors duration-200`}
        >
          {saveStatus === 'saving' ? (
            <Loader className="h-4 w-4 mr-2 animate-spin" />
          ) : saveStatus === 'success' ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : saveStatus === 'error' ? (
            <AlertCircle className="h-4 w-4 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saveStatus === 'saving' 
            ? 'Saving...' 
            : saveStatus === 'success' 
            ? 'Settings Saved!' 
            : saveStatus === 'error'
            ? 'Save Failed'
            : 'Save Settings'
          }
        </Button>
      </div>

      {/* Payment Provider Selection */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ToggleRight className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-lg font-medium text-gray-900">Payment Provider</h4>
              <p className="text-sm text-gray-600">Choose your active payment processing provider</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stripe Option */}
            <div
              onClick={() => switchProvider('stripe')}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                activeProvider === 'stripe'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <h5 className="text-lg font-medium text-gray-900">Stripe</h5>
                    <p className="text-sm text-gray-600">Industry standard payment processing</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {settings.stripeConnected ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-orange-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Setup Required</span>
                    </div>
                  )}
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    activeProvider === 'stripe'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {activeProvider === 'stripe' && (
                      <div className="w-full h-full rounded-full bg-white" style={{ transform: 'scale(0.5)' }} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Square Option */}
            <div
              onClick={() => switchProvider('square')}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                activeProvider === 'square'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Square className="h-6 w-6 text-gray-700" />
                  <div className="ml-3">
                    <h5 className="text-lg font-medium text-gray-900">Square</h5>
                    <p className="text-sm text-gray-600">All-in-one business payment solution</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {settings.squareConnected ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-orange-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Setup Required</span>
                    </div>
                  )}
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    activeProvider === 'square'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {activeProvider === 'square' && (
                      <div className="w-full h-full rounded-full bg-white" style={{ transform: 'scale(0.5)' }} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Provider Status */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  Active Provider: <span className="capitalize font-bold text-gray-900">{activeProvider}</span>
                </span>
                {/* Show connection status for active provider */}
                {((activeProvider === 'stripe' && settings.stripeConnected) || 
                  (activeProvider === 'square' && settings.squareConnected)) ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Setup Required</span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => testConnection(activeProvider)}
                variant="outline"
                size="sm"
                disabled={testing === activeProvider}
              >
                {testing === activeProvider ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Provider Configuration */}
      {activeProvider === 'stripe' && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">Stripe Configuration</h4>
                  <p className="text-sm text-gray-600">Configure your Stripe payment processing</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {settings.stripeConnected ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Setup Required</span>
                  </div>
                )}
                <Button
                  onClick={() => testConnection('stripe')}
                  variant="outline"
                  size="sm"
                  disabled={testing === 'stripe'}
                >
                  {testing === 'stripe' ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publishable Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKeys ? 'text' : 'password'}
                      value={settings.stripePublishableKey}
                      onChange={(e) => handleSimpleSettingChange('stripePublishableKey', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKeys(!showApiKeys)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showApiKeys ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKeys ? 'text' : 'password'}
                      value={settings.stripeSecretKey}
                      onChange={(e) => handleSimpleSettingChange('stripeSecretKey', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Secret
                </label>
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={settings.stripeWebhookSecret}
                  onChange={(e) => handleSimpleSettingChange('stripeWebhookSecret', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeProvider === 'square' && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Square className="h-5 w-5 text-gray-700" />
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">Square Configuration</h4>
                  <p className="text-sm text-gray-600">Configure your Square payment processing</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {settings.squareConnected ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Setup Required</span>
                  </div>
                )}
                <Button
                  onClick={() => testConnection('square')}
                  variant="outline"
                  size="sm"
                  disabled={testing === 'square'}
                >
                  {testing === 'square' ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application ID
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKeys ? 'text' : 'password'}
                      value={settings.squareApplicationId}
                      onChange={(e) => handleSimpleSettingChange('squareApplicationId', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKeys(!showApiKeys)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showApiKeys ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Token
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKeys ? 'text' : 'password'}
                      value={settings.squareAccessToken}
                      onChange={(e) => handleSimpleSettingChange('squareAccessToken', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Signature Key
                </label>
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={settings.squareWebhookSecret}
                  onChange={(e) => handleSimpleSettingChange('squareWebhookSecret', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Square-specific settings */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="ml-2">
                    <h6 className="text-sm font-medium text-yellow-800">Square Environment</h6>
                    <p className="text-xs text-yellow-700 mt-1">
                      Currently configured for Sandbox mode. Switch to Production credentials for live transactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Methods */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-lg font-medium text-gray-900">Payment Methods</h4>
              <p className="text-sm text-gray-600">Enable and configure payment options</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Accepted Payment Methods</h5>
                <div className="space-y-3">
                  {Object.entries(settings.paymentMethods).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleSettingChange('paymentMethods', key, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-3">Currency Settings</h5>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleSimpleSettingChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Fees and Pricing */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Settings className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-lg font-medium text-gray-900">Fees & Pricing</h4>
              <p className="text-sm text-gray-600">Configure processing fees and tax rates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Processing Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.processingFee}
                onChange={(e) => handleSimpleSettingChange('processingFee', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fixed Fee ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.fixedFee}
                onChange={(e) => handleSimpleSettingChange('fixedFee', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => handleSimpleSettingChange('taxRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-lg font-medium text-gray-900">Security Settings</h4>
              <p className="text-sm text-gray-600">Configure payment security and fraud protection</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">Require CVV Verification</h5>
                <p className="text-sm text-gray-600">Require CVV code for all card payments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireCVV}
                  onChange={(e) => handleSimpleSettingChange('requireCVV', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">Enable 3D Secure</h5>
                <p className="text-sm text-gray-600">Add extra authentication for European cards</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable3DSecure}
                  onChange={(e) => handleSimpleSettingChange('enable3DSecure', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">Fraud Detection</h5>
                <p className="text-sm text-gray-600">Automatically detect and prevent fraudulent transactions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.fraudDetection}
                  onChange={(e) => handleSimpleSettingChange('fraudDetection', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bell className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-lg font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Configure automatic email notifications</p>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(settings.emailNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </h5>
                  <p className="text-sm text-gray-600">
                    Send notifications when {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleSettingChange('emailNotifications', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Refund Policy */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-lg font-medium text-gray-900">Refund Policy</h4>
              <p className="text-sm text-gray-600">Configure refund and cancellation policies</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Policy
              </label>
              <select
                value={settings.refundPolicy}
                onChange={(e) => handleSimpleSettingChange('refundPolicy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="flexible">Flexible</option>
                <option value="moderate">Moderate</option>
                <option value="strict">Strict</option>
                <option value="no-refunds">No Refunds</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Window (hours)
              </label>
              <input
                type="number"
                value={settings.refundWindow}
                onChange={(e) => handleSimpleSettingChange('refundWindow', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Late Payment Fee ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.latePaymentFee}
                onChange={(e) => handleSimpleSettingChange('latePaymentFee', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BillingConfiguration;