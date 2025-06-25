import express from 'express';
import { addManyData, createNews, deleteNews, getHomePageNews, getNews } from '../controllers/news.controller';


const router = express.Router();

router.post('/create', createNews);
router.post('/addManyData',addManyData);
router.get('/homepagenews',getHomePageNews);
router.get('/getNews', getNews);
router.delete('/deleteNews/:id',deleteNews)

export default router;
