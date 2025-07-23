import { IncomingMessage, ServerResponse } from 'http';

export const setHttpOnlyCookie = (
  res: ServerResponse,
  name: string,
  value: string,
  options: {
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    path?: string;
  } = {}
) => {
  const {
    maxAge = 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
    httpOnly = true,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'lax',
    path = '/'
  } = options;

  const expires = new Date(Date.now() + maxAge);
  
  let cookie = `${name}=${value}; Path=${path}; Expires=${expires.toUTCString()}`;
  
  if (httpOnly) {
    cookie += '; HttpOnly';
  }
  
  if (secure) {
    cookie += '; Secure';
  }
  
  cookie += `; SameSite=${sameSite}`;
  
  // Set the cookie header
  const existingCookies = res.getHeader('Set-Cookie') as string[] || [];
  res.setHeader('Set-Cookie', [...existingCookies, cookie]);
};

export const clearCookie = (
  res: ServerResponse,
  name: string,
  options: {
    path?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
) => {
  const {
    path = '/',
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'lax'
  } = options;

  let cookie = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`;
  
  if (secure) {
    cookie += '; Secure';
  }
  
  cookie += `; SameSite=${sameSite}`;
  
  const existingCookies = res.getHeader('Set-Cookie') as string[] || [];
  res.setHeader('Set-Cookie', [...existingCookies, cookie]);
};