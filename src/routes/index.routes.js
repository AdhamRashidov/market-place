import { Router } from "express";

import adminRouter from './admin.routes.js';
import { pageError } from '../error/page-not-found.error.js';
import sallerRouter from './saller.routes.js';
import categoryRouter from './category.routes.js';
import productRouter from './product.routes.js';

const router = Router();

router
    .use('/admin', adminRouter)
    .use('/saller', sallerRouter)
    .use('/category', categoryRouter)
    .use('/product', productRouter)
    .use(pageError)

export default router;