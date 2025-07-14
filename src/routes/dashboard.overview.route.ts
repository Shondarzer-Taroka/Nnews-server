import express,{RequestHandler} from 'express';
import { getDashboardOverView, getHistoricalData } from '../controllers/dashboard.overview.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/isAdmin';

const router = express.Router();

router.get('/', authenticate, isAdmin as RequestHandler,getDashboardOverView);
router.get('/historical',authenticate, isAdmin as RequestHandler,getHistoricalData);

export default router;