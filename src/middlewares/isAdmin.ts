import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;

  if (user?.role === 'admin') {
    return next();
  }

  return res.status(403).json({ message: '⛔ Unauthorized. Admin only.' });
};
