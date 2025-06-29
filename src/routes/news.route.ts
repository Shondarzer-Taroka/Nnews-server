import express from 'express';
import { addManyData, createNews, deleteAllNews, deleteNews, getCategorizedNews, getHomePageNews, getNews, getSingleNews, getTitleForDescription } from '../controllers/news.controller';


const router = express.Router();

router.post('/create', createNews);
router.post('/addManyData',addManyData);
router.delete('/deleteAllNews',deleteAllNews);
router.get('/homepagenews',getHomePageNews);
router.get('/getSingleNews/:id',getSingleNews)
router.get('/getTitleForDescription/:category',getTitleForDescription)
router.get('/getCategorizedNews/:category',getCategorizedNews)
router.get('/getNews', getNews);
router.delete('/deleteNews/:id',deleteNews)

export default router;

