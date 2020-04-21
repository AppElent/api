import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

import { Op } from 'sequelize';
import moment from 'moment';
import Cache from '../modules/Cache';
import SequelizeRoutes from '../modules/express-sequelize-routes';
import { basicAuthentication } from '../middleware/authentication';
import { cacheMiddleware, asyncHandler } from '../modules/express-collection';
import { Meterstanden } from '../models';

const longCache = new Cache();
const shortCache = new Cache(300);
const routes = new SequelizeRoutes({ idColumnName: 'id', userColumnName: 'userId', reqUserProperty: 'uid' });

interface CustomRequest extends Request {
    uid?: string;
}

const deleteMeterstanden = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    await Meterstanden.destroy({
        where: {
            datetime: {
                [Op.lt]: moment()
                    .subtract(3, 'days')
                    .startOf('day')
                    .toDate(),
            },
            userId: req.uid,
        },
    });
    next();
};

router.use(basicAuthentication);
router.get('/:id', cacheMiddleware(longCache), asyncHandler(routes.get(Meterstanden)));
router.get('/', cacheMiddleware(shortCache), asyncHandler(routes.list(Meterstanden)));
router.post('/', deleteMeterstanden, asyncHandler(routes.create(Meterstanden)));
router.put('/:id', asyncHandler(routes.update(Meterstanden)));
router.delete('/:id', asyncHandler(routes.destroy(Meterstanden)));
router.get('/:column/:value', cacheMiddleware(longCache), asyncHandler(routes.find(Meterstanden)));

export default router;
