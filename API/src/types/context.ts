import { Request } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export interface Context {
  user?: {
    id: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
  } | null;
  req?: Request;
}

export const getUserFromToken = async (req: Request) => {
  // Get the user token from the headers
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user from database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}; 