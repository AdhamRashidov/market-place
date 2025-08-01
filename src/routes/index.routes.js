import { Router } from "express";
import adminRouter from './admin.routes.js';
import { pageError } from '../error/page-not-found.error.js';
import sallerRouter from './saller.routes.js';

const router = Router();

router
    .use('/admin', adminRouter)
    .use('/saller', sallerRouter)
    .use(pageError)

export default router;