"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const news_controller_1 = require("../controllers/news.controller");
const router = express_1.default.Router();
router.post('/create', news_controller_1.createNews);
router.post('/addManyData', news_controller_1.addManyData);
router.delete('/deleteAllNews', news_controller_1.deleteAllNews);
router.get('/homepagenews', news_controller_1.getHomePageNews);
router.get('/getSingleNews/:id', news_controller_1.getSingleNews);
router.get('/getTitleForDescription/:category', news_controller_1.getTitleForDescription);
router.get('/getNews', news_controller_1.getNews);
router.delete('/deleteNews/:id', news_controller_1.deleteNews);
exports.default = router;
