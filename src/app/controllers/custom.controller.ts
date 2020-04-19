import express, { Request, Response } from 'express';
const router = express.Router();
import axios from 'axios';

import { basicAuthentication } from '../middleware/authentication';
import { asyncHandler } from '../modules/express-collection';

export const redirectCall = async (req: Request, res: Response): Promise<Response> => {
    const { body, headers, url, method } = req.body;

    console.log('Making call to ' + url + ' with method ' + method);
    const data = await axios({
        url,
        method,
        headers,
        data: body,
    });
    return res.send(data);
};

const displayCall = async (req: Request, res: Response): Promise<Response> => {
    console.log('Body', req.body);
    return res.send(req.body);
};

router.use(basicAuthentication);
router.post('/proxyrequest', asyncHandler(redirectCall));
router.all('/show', asyncHandler(displayCall));
export default router;
