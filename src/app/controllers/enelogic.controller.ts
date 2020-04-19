import express, { Request, Response } from 'express';
const router = express.Router();
import Enelogic from 'enelogic';

import Cache from '../modules/Cache';
import { basicAuthentication } from '../middleware/authentication';
import { cacheMiddleware, asyncHandler } from '../modules/express-collection';

const enelogicCache = new Cache();

const getMeasuringPoints = async (req: Request, res: Response): Promise<Response> => {
    if (req.query.access_token === undefined)
        return res.send({ success: false, message: 'No query param access_token present' });
    const enelogic = new Enelogic(req.query.access_token as string);
    const measuringpoints = await enelogic.getMeasuringPoints();
    return res.send({ success: true, data: measuringpoints });
};

const getData = async (req: Request, res: Response): Promise<Response> => {
    if (req.query.access_token === undefined)
        return res.send({ success: false, message: 'No query param access_token present' });
    const enelogic = new Enelogic(req.query.access_token as string);
    const options = {
        mpointelectra: req.query.mpointelectra,
    };
    const data = await enelogic.getFormattedData(
        req.params.start,
        req.params.end,
        req.params.period.toUpperCase(),
        options,
    );
    return res.send(data);
};

const getYearConsumption = async (req: Request, res: Response): Promise<Response> => {
    if (req.query.access_token === undefined)
        return res.send({ success: false, message: 'No query param access_token present' });
    const enelogic = new Enelogic(req.query.access_token as string);
    const options = {
        mpointelectra: req.query.mpointelectra,
    };
    const data = await enelogic.getYearConsumption(options);
    return res.send(data);
};

router.use(basicAuthentication);
router.get('/data/:period/:start/:end', cacheMiddleware(enelogicCache), asyncHandler(getData));
router.get('/measuringpoints', asyncHandler(getMeasuringPoints));
router.get('/consumption', asyncHandler(getYearConsumption));

export default router;
