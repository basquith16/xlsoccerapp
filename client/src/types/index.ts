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