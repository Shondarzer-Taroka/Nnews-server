"use strict";
// // src/routes/epaper.routes.ts
// import express from 'express';
// import {
//   createEpaper,
//   getAllEpapers,
//   getEpaperById,
//   updateEpaper,
//   deleteEpaper,
//   getEpapersByDateRange,
//   getLatestEpapers
// } from '../controllers/epaper.controller';
// import { authenticate } from '../middlewares/auth.middleware';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const router = express.Router();
// // Protected routes
// router.post('/', authenticate, createEpaper);
// router.put('/:id', authenticate, updateEpaper);
// router.delete('/:id', authenticate, deleteEpaper);
// // Public routes
// router.get('/', getAllEpapers);
// router.get('/latest', getLatestEpapers);
// router.get('/date-range', getEpapersByDateRange);
// router.get('/:id', getEpaperById);
// export default router;
// src/routes/epaper.routes.ts
// import  express from  'express';
const express_1 = __importDefault(require("express")); // ✅ FIXED
const epaper_controller_1 = require("../controllers/epaper.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Protected routes
router.post('/addManyData', epaper_controller_1.addManyData);
router.post('/create', auth_middleware_1.authenticate, epaper_controller_1.createEpaper);
router.put('/:id', auth_middleware_1.authenticate, epaper_controller_1.updateEpaper);
router.delete('/:id', auth_middleware_1.authenticate, epaper_controller_1.deleteEpaper);
// Public routes
router.get('/getAllEpapers', epaper_controller_1.getAllEpapers);
router.get('/latest', epaper_controller_1.getLatestEpapers);
router.get('/date-range', epaper_controller_1.getEpapersByDateRange);
router.get('/:id', epaper_controller_1.getEpaperById);
exports.default = router;
