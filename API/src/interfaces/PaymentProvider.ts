export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  customerId?: string;
  description?: string;
}

export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface CustomerParams {
  userId: string;
  email: string;
  name?: string;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    fingerprint?: string;
  };
}

export interface SetupIntentResult {
  id: string;
  clientSecret: string;
  status: string;
}

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
  paymentMethod?: PaymentMethod | null;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  created: number;
}

export interface PaymentProvider {
  readonly name: string;
  readonly displayName: string;
  
  // Payment Intent Operations
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;
  getPaymentIntent(paymentIntentId: string): Promise<any>;
  confirmPaymentIntent(paymentIntentId: string): Promise<any>;
  
  // Customer Management
  getOrCreateCustomer(userId: string, email: string, name?: string): Promise<Customer>;
  getCustomer(customerId: string): Promise<Customer>;
  
  // Payment Methods
  getPaymentMethods(customerId: string): Promise<PaymentMethod[]>;
  attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<PaymentMethod>;
  detachPaymentMethod(paymentMethodId: string): Promise<PaymentMethod>;
  setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<Customer>;
  
  // Setup Intents (for saving payment methods)
  createSetupIntent(customerId: string, returnUrl?: string): Promise<SetupIntentResult>;
  
  // Payment History
  getPaymentHistory(customerId: string, limit?: number): Promise<PaymentHistoryItem[]>;
  
  // Webhook Processing
  processWebhook(payload: string, signature: string): Promise<WebhookEvent>;
  
  // Admin Operations
  getPaymentIntents(params?: any): Promise<any>;
  getCustomers(params?: any): Promise<any>;
  getInvoices(customerId: string): Promise<any>;
  getAllInvoices(params?: any): Promise<any>;
}

export enum PaymentProviderType {
  STRIPE = 'stripe',
  SQUARE = 'square'
}

export interface PaymentProviderConfig {
  type: PaymentProviderType;
  isActive: boolean;
  isDefault: boolean;
  config: {
    publicKey?: string;
    webhookSecret?: string;
    // Provider-specific config will be added here
  };
}