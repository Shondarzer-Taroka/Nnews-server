"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.emitToAdmins = exports.emitToUser = void 0;
// // app.ts
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./config/passport"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const news_route_1 = __importDefault(require("./routes/news.route"));
const voting_routes_1 = __importDefault(require("./routes/voting.routes"));
const epaper_routes_1 = __importDefault(require("./routes/epaper.routes"));
const opinion_routes_1 = __importDefault(require("./routes/opinion.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const likeComment_routes_1 = __importDefault(require("./routes/likeComment.routes"));
const user_admin_routes_1 = __importDefault(require("./routes/user.admin.routes"));
const dashboard_overview_route_1 = __importDefault(require("./routes/dashboard.overview.route"));
const jwtVerify_1 = require("./utils/jwtVerify");
dotenv_1.default.config();
const app = (0, express_1.default)();
// 🔑 Middleware setup
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// ✅ Correct CORS for cross-origin cookies
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'https://dailytnnewsbd.vercel.app'],
    credentials: true,
}));
// // sockt
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
    }
});
exports.io = io;
// Socket.IO middleware for authentication
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log('ksdjf', socket);
    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }
    const user = (0, jwtVerify_1.verifyTokenSocket)(token);
    if (!user) {
        return next(new Error('Authentication error: Invalid token'));
    }
    socket.data.user = user;
    next();
});
// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user.id}`);
    // Join user-specific room
    socket.join(`user_${socket.data.user.id}`);
    // Join admin room if user is admin
    if (socket.data.user.role === 'admin') {
        socket.join('admin_room');
        console.log(`Admin joined: ${socket.data.user.id}`);
    }
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.data.user.id}`);
    });
});
// Helper functions for emitting events
const emitToUser = (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
};
exports.emitToUser = emitToUser;
const emitToAdmins = (event, data) => {
    io.to('admin_room').emit(event, data);
};
exports.emitToAdmins = emitToAdmins;
httpServer.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
//  Secure session configuration
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production', // Set true for production
        // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', //  Important for cross-origin
        secure: true, //  Set true for production
        sameSite: 'none', //  Important for cross-origin
        maxAge: 1000 * 60 * 60 * 24,
    },
}));
//  Passport setup
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Routes
app.use('/api/users', user_route_1.default);
app.use('/api/users', user_admin_routes_1.default);
app.use('/api/news', news_route_1.default);
app.use('/api/poll', voting_routes_1.default);
app.use('/api/epaper', epaper_routes_1.default);
// app.use('/api/opinion', opinionRoutes);
// Routes
// app.use('/api/auth', authRoutes);
app.use('/api/opinion', opinion_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/likeComment', likeComment_routes_1.default);
app.use('/api/dashboard', dashboard_overview_route_1.default);
exports.default = app;
