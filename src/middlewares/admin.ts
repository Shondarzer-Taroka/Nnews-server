// import { Request, Response, NextFunction } from 'express';

// export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
//   if (req.isAuthenticated() && req.user?.role === 'admin') {
//     return next(); 
//   } 
//   return res.status(403).json({ message: 'Unauthorized. Admin only.' });
// };





import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client'; // Import the User type

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as User; // 👈 Type assertion to fix the error

  if (req.isAuthenticated() && user?.role === 'admin') {
    return next();
  }

  return res.status(403).json({ message: '⛔ Unauthorized. Admin only.' });
};
