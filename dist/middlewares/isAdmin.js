"use strict";
// isAdmin.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const isAdmin = (req, res, next) => {
    const user = req.user;
    // console.log('is admin', req.user);
    if (user?.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: '⛔ Unauthorized. Admin only.' });
};
exports.isAdmin = isAdmin;
