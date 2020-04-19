import express from 'express';
const router = express.Router();

import SequelizeRoutes from '../modules/express-sequelize-routes';
import { basicAuthentication } from '../middleware/authentication';
import { cacheMiddleware, asyncHandler } from '../modules/express-collection';
import Cache from '../modules/Cache';

import { Events } from '../models';

const eventsCache = new Cache();
const shortCache = new Cache(60);
const routes = new SequelizeRoutes({ idColumnName: 'id', userColumnName: 'userId', reqUserProperty: 'uid' });

router.use(basicAuthentication);
router.get('/:id', cacheMiddleware(eventsCache), asyncHandler(routes.get(Events)));
router.get('/', cacheMiddleware(shortCache), asyncHandler(routes.list(Events)));
router.post('/', asyncHandler(routes.create(Events)));
router.put('/:id', asyncHandler(routes.update(Events)));
router.delete('/:id', asyncHandler(routes.destroy(Events)));
router.get('/:column/:value', cacheMiddleware(eventsCache), asyncHandler(routes.find(Events)));

export default router;
