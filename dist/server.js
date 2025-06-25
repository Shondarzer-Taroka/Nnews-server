"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
app_1.default.use(express_1.default.json());
app_1.default.use((0, cookie_parser_1.default)());
const PORT = process.env.PORT || 7700;
app_1.default.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
