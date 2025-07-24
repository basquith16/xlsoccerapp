// Demo data generators for analytics dashboard
import { subDays, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  sessions: number;
  customers: number;
}

export interface CustomerDataPoint {
  date: string;
  newCustomers: number;
  churned: number;
  retained: number;
  totalActive: number;
}

export interface OperationalDataPoint {
  date: string;
  bookingRate: number;
  cancelRate: number;
  noShowRate: number;
  utilization: number;
}

// Generate revenue trend data
export const generateRevenueData = (days: number = 30): RevenueDataPoint[] => {
  const data: RevenueDataPoint[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const baseRevenue = 800 + Math.random() * 400;
    const weekendMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 1.4 : 1;
    
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      revenue: Math.round(baseRevenue * weekendMultiplier),
      sessions: Math.round((15 + Math.random() * 10) * weekendMultiplier),
      customers: Math.round((12 + Math.random() * 8) * weekendMultiplier),
    });
  }
  
  return data;
};

// Generate customer analytics data
export const generateCustomerData = (days: number = 30): CustomerDataPoint[] => {
  const data: CustomerDataPoint[] = [];
  let totalActive = 1200;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const newCustomers = Math.round(5 + Math.random() * 10);
    const churned = Math.round(1 + Math.random() * 4);
    const retained = totalActive - churned + newCustomers;
    
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      newCustomers,
      churned,
      retained: Math.round(retained * 0.98), // 98% retention simulation
      totalActive: retained,
    });
    
    totalActive = retained;
  }
  
  return data;
};

// Generate operational metrics
export const generateOperationalData = (days: number = 30): OperationalDataPoint[] => {
  const data: OperationalDataPoint[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      bookingRate: Math.round((75 + Math.random() * 20) * (isWeekend ? 1.2 : 1)),
      cancelRate: Math.round(5 + Math.random() * 8),
      noShowRate: Math.round(2 + Math.random() * 5),
      utilization: Math.round((80 + Math.random() * 15) * (isWeekend ? 1.1 : 1)),
    });
  }
  
  return data;
};

// Generate monthly comparison data
export const generateMonthlyComparison = () => {
  const currentMonth = new Date();
  const lastMonth = subDays(startOfMonth(currentMonth), 1);
  
  return {
    current: {
      revenue: 28920 + Math.round(Math.random() * 5000),
      customers: 892 + Math.round(Math.random() * 100),
      sessions: 2156 + Math.round(Math.random() * 300),
      avgValue: 41.80 + Math.round(Math.random() * 10),
    },
    previous: {
      revenue: 26750 + Math.round(Math.random() * 3000),
      customers: 863 + Math.round(Math.random() * 80),
      sessions: 2005 + Math.round(Math.random() * 200),
      avgValue: 42.20 + Math.round(Math.random() * 8),
    },
  };
};

// Generate customer segmentation data
export const generateCustomerSegmentation = () => [
  { segment: 'Premium', count: 156, revenue: 12450, color: '#3b82f6' },
  { segment: 'Regular', count: 489, revenue: 18920, color: '#10b981' },
  { segment: 'Casual', count: 247, revenue: 6550, color: '#f59e0b' },
  { segment: 'Trial', count: 98, revenue: 1200, color: '#ef4444' },
];

// Generate popular time slots data
export const generateTimeSlotData = () => [
  { time: '9:00 AM', bookings: 45, utilization: 85 },
  { time: '10:00 AM', bookings: 52, utilization: 92 },
  { time: '11:00 AM', bookings: 48, utilization: 88 },
  { time: '2:00 PM', bookings: 38, utilization: 72 },
  { time: '3:00 PM', bookings: 41, utilization: 78 },
  { time: '4:00 PM', bookings: 55, utilization: 98 },
  { time: '5:00 PM', bookings: 58, utilization: 100 },
  { time: '6:00 PM', bookings: 62, utilization: 100 },
  { time: '7:00 PM', bookings: 49, utilization: 89 },
];

// Generate cohort analysis data (simplified)
export const generateCohortData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const cohorts = [];
  
  months.forEach((month, monthIndex) => {
    const cohort = { month, data: [] as number[] };
    
    for (let i = 0; i <= 5 - monthIndex; i++) {
      // Simulate retention decay
      let retention = 100;
      if (i === 1) retention = 75 + Math.random() * 15;
      else if (i === 2) retention = 60 + Math.random() * 15;
      else if (i === 3) retention = 50 + Math.random() * 15;
      else if (i === 4) retention = 45 + Math.random() * 10;
      else if (i === 5) retention = 40 + Math.random() * 10;
      
      cohort.data.push(Math.round(retention));
    }
    
    cohorts.push(cohort);
  });
  
  return cohorts;
};

// Generate forecasting data
export const generateForecastData = () => {
  const historical = generateRevenueData(30);
  const forecast = [];
  
  // Simple trend-based forecast
  const lastWeekAvg = historical.slice(-7).reduce((sum, d) => sum + d.revenue, 0) / 7;
  const trendMultiplier = 1.05; // 5% growth trend
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    forecast.push({
      date: format(date, 'yyyy-MM-dd'),
      predicted: Math.round(lastWeekAvg * trendMultiplier * (1 + (Math.random() - 0.5) * 0.2)),
      confidence: {
        lower: Math.round(lastWeekAvg * trendMultiplier * 0.85),
        upper: Math.round(lastWeekAvg * trendMultiplier * 1.15),
      },
    });
  }
  
  return { historical, forecast };
};