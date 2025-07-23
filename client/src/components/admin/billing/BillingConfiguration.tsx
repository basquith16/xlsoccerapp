import React, { useState } from 'react';
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
  EyeOff
} from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

const BillingConfiguration: React.FC = () => {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [settings, setSettings] = useState({
    // Stripe Configuration
    stripePublishableKey: 'pk_test_51NctyzC5wZsDYstk...',
    stripeSecretKey: 'sk_test_51NctyzC5wZsDYstk...',
    stripeWebhookSecret: 'whsec_1234567890...',
    
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

  const saveSettings = () => {
    console.log('Saving billing settings:', settings);
    // Implementation would save settings via GraphQL mutation
  };

  const testStripeConnection = () => {
    console.log('Testing Stripe connection...');
    // Implementation would test Stripe API connection
  };

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
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      {/* Stripe Configuration */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h4 className="text-lg font-medium text-gray-900">Stripe Integration</h4>
                <p className="text-sm text-gray-600">Configure your Stripe payment processing</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Connected</span>
              </div>
              <Button
                onClick={testStripeConnection}
                variant="outline"
                size="sm"
              >
                Test Connection
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