// User types
export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  role: 'user' | 'coach' | 'admin';
  club?: string;
  assignedSessions?: string[];
  waiverSigned: boolean;
  joinedDate: string;
  birthday?: string;
  active: boolean;
}

// Enums to match backend
export enum SportType {
  SOCCER = 'Soccer',
  VOLLEYBALL = 'Volleyball',
  BASKETBALL = 'Basketball',
  TENNIS = 'Tennis',
  BASEBALL = 'Baseball',
  FOOTBALL = 'Football'
}

export enum DemoType {
  YOUTH = 'Youth',
  TEEN = 'Teen',
  ADULT = 'Adult',
  ELITE = 'Elite',
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

// Session types
export interface Session {
  id: string;
  sport: 'soccer' | 'basketball' | 'volleyball' | 'camp' | 'futsal' | 'football';
  demo: 'boys' | 'girls' | 'coed';
  name: string;
  image?: string[];
  price: number;
  priceDiscount?: number;
  startDates: string[];
  endDate: string[];
  birthYear: number;
  ageRange?: {
    minAge: number;
    maxAge: number;
  };
  timeStart: string;
  timeEnd: string;
  trainers?: User[];
  rosterLimit: number;
  slug: string;
  staffOnly: boolean;
  description?: string;
  duration?: string;
  profileImages?: string[];
}

// Booking types
export interface Booking {
  id: string;
  session: Session;
  user: User;
  player: Player;
  price: number;
  createdAt: string;
  paid: boolean;
}

// Review types
export interface Review {
  id: string;
  review: string;
  rating: number;
  createdAt: string;
  user: User;
  session?: Session;
}

// Player types
export interface Player {
  id: string;
  name: string;
  birthDate: string;
  sex: 'male' | 'female';
  waiverSigned: boolean;
  isMinor: boolean;
  profImg?: string;
  parent: string; // User ID
}

// Session Template types
export interface SessionTemplate {
  id: string;
  name: string;
  sport: SportType;
  demo: DemoType;
  description: string;
  birthYear: string;
  rosterLimit: number;
  price: number;
  trainer?: string;
  staffOnly: boolean;
  slug: string;
  coverImage?: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Schedule Period types
export interface SchedulePeriod {
  id: string;
  templateId: string;
  name: string;
  startDate: string;
  endDate: string;
  coachIds: string[];
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  templateInfo?: SessionTemplate;
  instances?: any[];
  instancesCount?: number;
  activeInstancesCount?: number;
}

// Session Instance types
export interface SessionInstance {
  id: string;
  periodId: string;
  templateId: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  coachIds: string[];
  capacity: number;
  bookedCount?: number;
  notes?: string;
  isActive: boolean;
  isCancelled?: boolean;
  createdAt: string;
  updatedAt: string;
  templateInfo?: SessionTemplate;
  periodInfo?: SchedulePeriod;
  coachInfo?: User[];
  bookingPercentage?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  token?: string;
  data?: {
    user: User;
  };
  message?: string;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  birthday: string;
}

export interface UpdateProfileFormData {
  name?: string;
  email?: string;
  photo?: File;
}

export interface UpdatePasswordFormData {
  passwordCurrent: string;
  password: string;
  passwordConfirm: string;
}

// Context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  register: (userData: RegisterFormData) => Promise<{ success: boolean; data?: any; error?: string }>;
  logout: () => Promise<{ success: boolean }>;
  updateProfile: (userData: UpdateProfileFormData) => Promise<{ success: boolean; data?: any; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; data?: any; error?: string }>;
} 