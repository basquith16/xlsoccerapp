import { IUser } from './models';

export interface AuthContext {
  user: IUser | null;
}

export interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
} 