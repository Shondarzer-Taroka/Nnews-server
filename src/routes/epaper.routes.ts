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
import express, { RequestHandler } from 'express'; // ✅ FIXED
import {
    createEpaper,
      getAllEpapers,
      getEpaperById,
    updateEpaper,
    deleteEpaper,
      getEpapersByDateRange,
      getLatestEpapers,
      addManyData
} from '../controllers/epaper.controller';
import { authenticate } from '../middlewares/auth.middleware';



const router = express.Router();

// Protected routes
router.post('/addManyData',addManyData)
router.post('/create', authenticate, createEpaper as RequestHandler);
router.put('/:id', authenticate, updateEpaper as RequestHandler);
router.delete('/:id',authenticate, deleteEpaper as RequestHandler);

// Public routes
router.get('/getAllEpapers', getAllEpapers);
router.get('/latest', getLatestEpapers);
router.get('/date-range', getEpapersByDateRange);
router.get('/:id', getEpaperById);

export default router;