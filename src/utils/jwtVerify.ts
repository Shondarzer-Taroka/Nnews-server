

import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  role: string;
}

export const verifyTokenSocket = (token: string): UserPayload | null => {
  try {
    console.log(token,'sokcet token');
    
    if (!token) return null;
    const secret = process.env.JWT_SECRET || 'your_jwt_secret';
    const decoded = jwt.verify(token, secret);
    console.log('socket jwt',decoded);
    
    return decoded as UserPayload;
  } catch (error) {
    return null;
  }
};
