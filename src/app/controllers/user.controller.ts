import express from 'express';
const router = express.Router();

import SequelizeRoutes from '../modules/express-sequelize-routes';
import { basicAuthentication } from '../middleware/authentication';
import { cacheMiddleware, asyncHandler } from '../modules/express-collection';
import Cache from '../modules/Cache';

import { User } from '../models';

const eventsCache = new Cache();
const routes = new SequelizeRoutes({ idColumnName: 'uid', userColumnName: 'uid', reqUserProperty: 'uid' });

router.use(basicAuthentication);

router.get('/:uid', cacheMiddleware(eventsCache), asyncHandler(routes.get(User)));

export default router;
