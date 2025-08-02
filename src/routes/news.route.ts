import express from 'express';
import { addManyData, createNews, deleteAllNews, deleteNews, getCategorizedNews, getHomePageNews, getLatestAndMostReadNews, getNews, getNewsForDashboard, getSearchNews, getSearchNewsdpsk, getSingleNews, getTitleForDescription, incrementNewsView, updateNews } from '../controllers/news.controller';
import { getNewsArea } from '../controllers/news.another.controller';


const router = express.Router();

router.post('/create', createNews);
router.post('/addManyData',addManyData);
router.delete('/deleteAllNews',deleteAllNews);
router.get('/getNewsForDashboard',getNewsForDashboard)
router.get('/homepagenews',getHomePageNews);
router.get('/getSingleNews/:id',getSingleNews)
router.get('/getTitleForDescription/:category',getTitleForDescription)
router.get('/getCategorizedNews/:category',getCategorizedNews)
router.get('/getNews', getNews);
router.delete('/deleteNews/:id',deleteNews)
router.put('/update/:id',updateNews)
router.get('/news-tabs', getLatestAndMostReadNews);
router.patch('/incrementNewsView/:id/view', incrementNewsView);
router.get('/search', getSearchNews);
router.get('/searchdspk', getSearchNewsdpsk);
router.get('/area',getNewsArea)


export default router;

