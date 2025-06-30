"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./config/passport"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_route_1 = __importDefault(require("./routes/user.route"));
// import ePaperRoutes from './routes/ePaper.routes';
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const news_route_1 = __importDefault(require("./routes/news.route"));
const voting_routes_1 = __importDefault(require("./routes/voting.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'https://dailytnnewsbd.vercel.app'], // frontend URL
    credentials: true
}));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
    },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use('/api/users', user_route_1.default);
app.use('/api/news', news_route_1.default);
app.use('/api/poll', voting_routes_1.default);
// app.use('/api/e-papers', ePaperRoutes);
exports.default = app;
