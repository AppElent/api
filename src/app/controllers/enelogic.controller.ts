import express, { Response } from 'express';
const router = express.Router();
import Enelogic from 'enelogic';

import Cache from '../modules/Cache';
import { basicAuthentication } from '../middleware/authentication';
import { cacheMiddleware, asyncHandler } from '../modules/express-collection';
import getAccessToken from '../helpers/getAccessToken';
import { CustomRequest } from '../types/CustomRequest';

const enelogicCache = new Cache();

const getMeasuringPoints = async (req: CustomRequest, res: Response): Promise<Response> => {
    let token: string = req.query.access_token as string;
    if (!req.query.access_token) {
        token = (await getAccessToken(req.uid, 'enelogic', true)).access_token;
    }
    if (!token) {
        return res.status(400).send('No access_token present or supplied');
    }
    const enelogic = new Enelogic(token);
    const measuringpoints = await enelogic.getMeasuringPoints();
    return res.send({ success: true, data: measuringpoints });
};

const getData = async (req: CustomRequest, res: Response): Promise<Response> => {
    let token: string = req.query.access_token as string;
    if (!req.query.access_token) {
        token = (await getAccessToken(req.uid, 'enelogic', true)).access_token;
    }
    if (!token) {
        return res.status(400).send('No access_token present or supplied');
    }
    const enelogic = new Enelogic(token);
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

const getYearConsumption = async (req: CustomRequest, res: Response): Promise<Response> => {
    let token: string = req.query.access_token as string;
    if (!req.query.access_token) {
        token = (await getAccessToken(req.uid, 'enelogic', true)).access_token;
    }
    if (!token) {
        return res.status(400).send('No access_token present or supplied');
    }
    const enelogic = new Enelogic(token);
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
