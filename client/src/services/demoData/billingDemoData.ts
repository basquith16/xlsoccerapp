// Demo data for billing dashboard
import { addDays, subDays, startOfMonth, endOfMonth } from 'date-fns';

export interface DemoTransaction {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded' | 'disputed';
  paymentMethod: string;
  sessionName: string;
  createdAt: string;
  stripeTransactionId: string;
  fees: number;
  netAmount: number;
}

export interface DemoCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalSpent: number;
  lastPayment: string;
  paymentMethods: any[];
  defaultPaymentMethod?: string;
  subscriptions: number;
  status: 'active' | 'inactive' | 'suspended';
  riskLevel: 'low' | 'medium' | 'high';
  joinedDate: string;
}

export interface DemoSubscription {
  id: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  status: 'active' | 'paused' | 'cancelled' | 'past_due';
  amount: number;
  interval: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBilling: string;
  createdAt: string;
}

// Generate realistic demo data
const generateDemoTransactions = (): DemoTransaction[] => {
  const transactions: DemoTransaction[] = [];
  const sessionTypes = [
    'Youth Soccer Training',
    'Adult League Games',
    'Private Coaching',
    'Summer Camp',
    'Birthday Party Package',
    'Team Training Session',
    'Skills Workshop',
    'Goalkeeper Training'
  ];
  
  const customers = [
    { name: 'John Smith', email: 'john.smith@email.com' },
    { name: 'Sarah Johnson', email: 'sarah.j@email.com' },
    { name: 'Mike Davis', email: 'mike.davis@email.com' },
    { name: 'Emily Wilson', email: 'emily.w@email.com' },
    { name: 'Robert Brown', email: 'robert.brown@email.com' },
    { name: 'Lisa Anderson', email: 'lisa.a@email.com' },
    { name: 'James Taylor', email: 'james.t@email.com' },
    { name: 'Maria Garcia', email: 'maria.g@email.com' },
    { name: 'David Martinez', email: 'david.m@email.com' },
    { name: 'Jennifer Lee', email: 'jennifer.l@email.com' }
  ];

  const now = new Date();
  
  // Generate 150 transactions over the last 90 days
  for (let i = 0; i < 150; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const session = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
    const daysAgo = Math.floor(Math.random() * 90);
    const amount = Math.floor(Math.random() * 150) + 25; // $25-$175
    const status = Math.random() > 0.9 ? 
      ['pending', 'failed', 'refunded', 'disputed'][Math.floor(Math.random() * 4)] as any : 
      'succeeded';
    
    const fees = amount * 0.029 + 0.30; // Stripe standard fees
    const netAmount = status === 'succeeded' ? amount - fees : 
                     status === 'refunded' ? -amount : 
                     status === 'failed' ? 0 : amount - fees;
    
    transactions.push({
      id: `txn_demo_${i + 1}`,
      customerName: customer.name,
      customerEmail: customer.email,
      amount,
      currency: 'USD',
      status,
      paymentMethod: `Visa •••• ${Math.floor(Math.random() * 9000) + 1000}`,
      sessionName: session,
      createdAt: subDays(now, daysAgo).toISOString(),
      stripeTransactionId: `pi_demo_${Math.random().toString(36).substr(2, 9)}`,
      fees,
      netAmount
    });
  }
  
  return transactions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

const generateDemoCustomers = (): DemoCustomer[] => {
  const customers: DemoCustomer[] = [
    {
      id: 'cus_demo_1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      totalSpent: 1250.00,
      lastPayment: subDays(new Date(), 2).toISOString(),
      paymentMethods: [
        {
          id: 'pm_demo_1',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true
        }
      ],
      defaultPaymentMethod: 'pm_demo_1',
      subscriptions: 2,
      status: 'active',
      riskLevel: 'low',
      joinedDate: subDays(new Date(), 180).toISOString()
    },
    {
      id: 'cus_demo_2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 987-6543',
      totalSpent: 875.50,
      lastPayment: subDays(new Date(), 5).toISOString(),
      paymentMethods: [
        {
          id: 'pm_demo_2',
          type: 'card',
          last4: '5555',
          brand: 'mastercard',
          expiryMonth: 8,
          expiryYear: 2026,
          isDefault: true
        }
      ],
      defaultPaymentMethod: 'pm_demo_2',
      subscriptions: 1,
      status: 'active',
      riskLevel: 'low',
      joinedDate: subDays(new Date(), 120).toISOString()
    },
    {
      id: 'cus_demo_3',
      name: 'Mike Davis',
      email: 'mike.davis@email.com',
      totalSpent: 425.00,
      lastPayment: subDays(new Date(), 15).toISOString(),
      paymentMethods: [],
      subscriptions: 0,
      status: 'inactive',
      riskLevel: 'medium',
      joinedDate: subDays(new Date(), 45).toISOString()
    }
  ];
  
  // Add more customers
  for (let i = 4; i <= 25; i++) {
    const isActive = Math.random() > 0.2;
    const hasSubscription = Math.random() > 0.4;
    
    customers.push({
      id: `cus_demo_${i}`,
      name: `Customer ${i}`,
      email: `customer${i}@email.com`,
      phone: Math.random() > 0.5 ? `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}` : undefined,
      totalSpent: Math.floor(Math.random() * 2000) + 100,
      lastPayment: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
      paymentMethods: isActive ? [{
        id: `pm_demo_${i}`,
        type: 'card',
        last4: `${Math.floor(Math.random() * 9000) + 1000}`,
        brand: ['visa', 'mastercard', 'american_express'][Math.floor(Math.random() * 3)],
        expiryMonth: Math.floor(Math.random() * 12) + 1,
        expiryYear: 2025 + Math.floor(Math.random() * 3),
        isDefault: true
      }] : [],
      defaultPaymentMethod: isActive ? `pm_demo_${i}` : undefined,
      subscriptions: hasSubscription ? Math.floor(Math.random() * 3) + 1 : 0,
      status: isActive ? 'active' : Math.random() > 0.5 ? 'inactive' : 'suspended',
      riskLevel: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
      joinedDate: subDays(new Date(), Math.floor(Math.random() * 365)).toISOString()
    });
  }
  
  return customers;
};

const generateDemoSubscriptions = (): DemoSubscription[] => {
  const subscriptions: DemoSubscription[] = [];
  const plans = [
    { name: 'Basic Monthly', amount: 19.99, interval: 'monthly' as const },
    { name: 'Premium Monthly', amount: 39.99, interval: 'monthly' as const },
    { name: 'Team Monthly', amount: 99.99, interval: 'monthly' as const },
    { name: 'Basic Yearly', amount: 199.99, interval: 'yearly' as const },
    { name: 'Premium Yearly', amount: 399.99, interval: 'yearly' as const },
    { name: 'Team Yearly', amount: 999.99, interval: 'yearly' as const }
  ];
  
  const customers = [
    { name: 'John Smith', email: 'john.smith@email.com' },
    { name: 'Sarah Johnson', email: 'sarah.j@email.com' },
    { name: 'Emily Wilson', email: 'emily.w@email.com' },
    { name: 'Robert Brown', email: 'robert.brown@email.com' },
    { name: 'Lisa Anderson', email: 'lisa.a@email.com' }
  ];
  
  customers.forEach((customer, index) => {
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const createdAt = subDays(new Date(), Math.floor(Math.random() * 180) + 30);
    const status = Math.random() > 0.8 ? 
      ['paused', 'cancelled', 'past_due'][Math.floor(Math.random() * 3)] as any : 
      'active';
    
    subscriptions.push({
      id: `sub_demo_${index + 1}`,
      customerName: customer.name,
      customerEmail: customer.email,
      planName: plan.name,
      status,
      amount: plan.amount,
      interval: plan.interval,
      currentPeriodStart: startOfMonth(new Date()).toISOString(),
      currentPeriodEnd: endOfMonth(new Date()).toISOString(),
      nextBilling: addDays(endOfMonth(new Date()), 1).toISOString(),
      createdAt: createdAt.toISOString()
    });
  });
  
  return subscriptions;
};

export interface DemoRefundDispute {
  id: string;
  type: 'refund' | 'dispute';
  customerName: string;
  customerEmail: string;
  transactionId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied' | 'processing' | 'completed';
  createdAt: string;
  updatedAt: string;
  description?: string;
  evidence?: string[];
}

const generateDemoRefundsDisputes = (): DemoRefundDispute[] => {
  const items: DemoRefundDispute[] = [];
  const customers = [
    { name: 'John Smith', email: 'john.smith@email.com' },
    { name: 'Sarah Johnson', email: 'sarah.j@email.com' },
    { name: 'Mike Davis', email: 'mike.davis@email.com' },
    { name: 'Emily Wilson', email: 'emily.w@email.com' },
    { name: 'Robert Brown', email: 'robert.brown@email.com' }
  ];

  const refundReasons = [
    'Requested by customer',
    'Session cancelled by facility',
    'Duplicate charge',
    'Customer unable to attend',
    'Equipment malfunction'
  ];

  const disputeReasons = [
    'Service not provided',
    'Unauthorized charge',
    'Session quality issues',
    'Billing error',
    'Cancelled session not refunded'
  ];

  // Generate refunds
  for (let i = 0; i < 8; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const createdAt = subDays(new Date(), Math.floor(Math.random() * 60));
    const updatedAt = Math.random() > 0.5 ? addDays(createdAt, Math.floor(Math.random() * 3)) : createdAt;
    
    items.push({
      id: `ref_demo_${i + 1}`,
      type: 'refund',
      customerName: customer.name,
      customerEmail: customer.email,
      transactionId: `txn_demo_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.floor(Math.random() * 100) + 25,
      reason: refundReasons[Math.floor(Math.random() * refundReasons.length)],
      status: ['pending', 'approved', 'completed'][Math.floor(Math.random() * 3)] as any,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      description: Math.random() > 0.5 ? 'Additional details about the refund request' : undefined
    });
  }

  // Generate disputes
  for (let i = 0; i < 4; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const createdAt = subDays(new Date(), Math.floor(Math.random() * 30));
    const updatedAt = addDays(createdAt, Math.floor(Math.random() * 5) + 1);
    
    items.push({
      id: `disp_demo_${i + 1}`,
      type: 'dispute',
      customerName: customer.name,
      customerEmail: customer.email,
      transactionId: `txn_demo_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.floor(Math.random() * 150) + 50,
      reason: disputeReasons[Math.floor(Math.random() * disputeReasons.length)],
      status: ['pending', 'processing', 'denied'][Math.floor(Math.random() * 3)] as any,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      description: 'Customer dispute details and supporting information',
      evidence: Math.random() > 0.5 ? ['email_thread.pdf', 'screenshot.jpg'] : undefined
    });
  }

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Calculate demo analytics
export const getDemoAnalytics = () => {
  const transactions = generateDemoTransactions();
  const last30Days = transactions.filter(t => 
    new Date(t.createdAt) > subDays(new Date(), 30)
  );
  
  const successfulTransactions = last30Days.filter(t => t.status === 'succeeded');
  const totalRevenue = successfulTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = successfulTransactions.length;
  const activeCustomers = new Set(successfulTransactions.map(t => t.customerEmail)).size;
  const averageOrder = totalRevenue / totalTransactions || 0;
  
  // Calculate monthly revenue for chart
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const month = subDays(new Date(), i * 30);
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.createdAt);
      return date.getMonth() === month.getMonth() && 
             date.getFullYear() === month.getFullYear() &&
             t.status === 'succeeded';
    });
    
    monthlyRevenue.push({
      month: month.toLocaleDateString('en-US', { month: 'short' }),
      revenue: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
      transactions: monthTransactions.length
    });
  }
  
  return {
    totalRevenue,
    totalTransactions,
    activeCustomers,
    averageOrder,
    monthlyRevenue,
    revenueChange: 12.5,
    transactionChange: 8.3,
    customerChange: 15.2,
    averageOrderChange: -2.1
  };
};

// Export data generators
export const demoData = {
  transactions: generateDemoTransactions(),
  customers: generateDemoCustomers(),
  subscriptions: generateDemoSubscriptions(),
  refundsDisputes: generateDemoRefundsDisputes(),
  analytics: getDemoAnalytics()
};

// Helper to add date-fns if not installed
export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};