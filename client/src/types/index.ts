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
  familyMembers?: Player[];
}

export interface Player {
  id: string;
  name: string;
  birthDate: string;
  sex: 'male' | 'female' | 'other';
  waiverSigned: boolean;
  isMinor: boolean;
  profImg?: string;
  parent?: User;
}

// Enums to match backend
export enum SportType {
  SOCCER = 'soccer',
  BASKETBALL = 'basketball',
  VOLLEYBALL = 'volleyball',
  CAMP = 'camp',
  FUTSAL = 'futsal',
  FOOTBALL = 'football'
}

export enum DemoType {
  BOYS = 'boys',
  GIRLS = 'girls',
  COED = 'coed'
}

// Session types
export interface Session {
  id: string;
  sport: SportType;
  demo: DemoType;
  name: string;
  image?: string[];
  images?: string[];
  coverImage?: string;
  price: number;
  priceDiscount?: number;
  startDates: string[];
  endDate: string;
  birthYear: number;
  ageRange?: {
    minAge: number;
    maxAge: number;
  };
  timeStart: string;
  timeEnd: string;
  trainer?: string;
  trainers?: User[];
  rosterLimit: number;
  availableSpots?: number;
  slug: string;
  staffOnly: boolean;
  isActive: boolean;
  isPubliclyVisible?: boolean;
  description?: string;
  duration?: string;
  field?: {
    fieldNumb: string;
    location: 'Inside' | 'Outside' | 'TBD';
  };
  createdAt: string;
  updatedAt: string;
}

export interface SessionTemplate {
  id: string;
  name: string;
  sport: SportType;
  description?: string;
  birthYear: number;
  ageRange?: {
    minAge: number;
    maxAge: number;
  };
  price: number;
  priceDiscount?: number;
  defaultDuration: number;
  trainers?: User[];
  isActive: boolean;
  coverImage?: string;
  images?: string[];
  rosterLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface SchedulePeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  template: SessionTemplate;
  daysOfWeek: number[];
  timeStart: string;
  timeEnd: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionInstance {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  template: SessionTemplate;
  period?: SchedulePeriod;
  trainers?: User[];
  availableSpots?: number;
  createdAt: string;
  updatedAt: string;
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

// API Response types
export interface AuthResponse {
  status: 'success' | 'error';
  data?: User;
  message?: string;
  errors?: Array<{
    message: string;
    code: string;
    field?: string;
  }>;
}

export interface LogoutResponse {
  status: 'success' | 'error';
  message: string;
}

export interface PaginatedResponse<T> {
  nodes: T[];
  totalCount: number;
  hasNextPage: boolean;
}

// Component Props types
export interface TableProps<T> {
  data: T[];
  loading?: boolean;
  error?: string;
}

export interface FilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  onReset: () => void;
  resultCount?: {
    filtered: number;
    total: number;
  };
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
}

// Form types
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  birthday: string;
  role?: string;
  active?: boolean;
  waiverSigned?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  photo?: string;
  role?: string;
  active?: boolean;
  waiverSigned?: boolean;
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