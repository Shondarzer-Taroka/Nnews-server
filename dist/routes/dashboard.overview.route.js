"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboard_overview_controller_1 = require("../controllers/dashboard.overview.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const isAdmin_1 = require("../middlewares/isAdmin");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.authenticate, isAdmin_1.isAdmin, dashboard_overview_controller_1.getDashboardOverView);
router.get('/historical', auth_middleware_1.authenticate, isAdmin_1.isAdmin, dashboard_overview_controller_1.getHistoricalData);
exports.default = router;
