import express, { Request, Response } from 'express';
const router = express.Router();
import SolarEdge, { Period } from 'solaredge';

import Cache from '../modules/Cache';
import { basicAuthentication } from '../middleware/authentication';
import { cacheMiddleware, asyncHandler } from '../modules/express-collection';

const solarEdgeCache = new Cache();

const timeUnits = ['HOUR', 'DAY', 'MONTH', 'QUARTER_OF_AN_HOUR', 'YEAR'];

/**
 * Get SolarEdge data
 * @param req {Request}
 * @param res {Response}
 */
const getData = async (req: Request, res: Response): Promise<Response> => {
    if (req.query.access_token === undefined)
        return res.send({ success: false, message: 'No query param access_token present' });
    if (timeUnits.includes(req.params.period.toUpperCase()) === false) {
        throw new Error(
            'Geen geldige periode opgegeven (Opgegeven: ' + req.params.period + '). Geldige waarden zijn: ' + timeUnits,
        );
    }
    const solaredge = new SolarEdge(req.query.access_token as string);
    const data = await solaredge.getData(
        parseInt(req.params.site),
        req.params.start,
        req.params.end,
        //'MONTH',
        req.params.period as Period,
    );
    return res.send({ success: true, data });
};

const getSiteData = async (req: Request, res: Response): Promise<Response> => {
    console.log(123);
    if (req.query.access_token === undefined)
        return res.send({ success: false, message: 'No query param access_token present' });
    const solaredge = new SolarEdge(req.query.access_token as string);
    const sites = await solaredge.getSiteData();
    return res.send({ success: true, data: sites });
};

const getEquipmentData = async (req: Request, res: Response): Promise<Response> => {
    if (req.query.access_token === undefined)
        return res.send({ success: false, message: 'No query param access_token present' });
    const solaredge = new SolarEdge(req.query.access_token as string);
    const equipment = await solaredge.getEquipmentData(parseInt(req.params.site));
    return res.send({ success: true, data: equipment });
};

//router.get('/sites/:period/:start/:end', basicAuthentication, cache(enelogicCache), getData);
router.use(basicAuthentication);
router.get('/sites', cacheMiddleware(solarEdgeCache), asyncHandler(getSiteData));
router.get('/:site/equipment', asyncHandler(getEquipmentData));
router.get('/:site/data/:period/:start/:end', cacheMiddleware(solarEdgeCache), asyncHandler(getData));

export default router;
