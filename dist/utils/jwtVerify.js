"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenSocket = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyTokenSocket = (token) => {
    try {
        console.log(token, 'sokcet token');
        if (!token)
            return null;
        const secret = process.env.JWT_SECRET || 'your_jwt_secret';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        console.log('socket jwt', decoded);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.verifyTokenSocket = verifyTokenSocket;
