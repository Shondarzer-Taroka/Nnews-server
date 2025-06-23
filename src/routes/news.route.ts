import express from 'express';
import { createNews, deleteNews, getNews } from '../controllers/news.controller';


const router = express.Router();

router.post('/create', createNews);
router.get('/getNews', getNews);
router.delete('/deleteNews/:id',deleteNews)

export default router;
