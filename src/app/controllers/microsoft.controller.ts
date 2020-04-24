import express, { Request, Response } from 'express';
const router = express.Router();
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

import Cache from '../modules/Cache';
import { basicAuthentication } from '../middleware/authentication';
import { cacheMiddleware, asyncHandler } from '../modules/express-collection';

const getProfile = async (req: Request, res: Response): Promise<Response> => {
    const client = Client.init({
        authProvider: done => {
            done(null, req.query.access_token as string); //first parameter takes an error if you can't get an access token
        },
    });
    const profile = await client.api('/me').get();
    return res.send({ success: true, data: profile });
};

router.use(basicAuthentication);
router.get('/profile', asyncHandler(getProfile));

export default router;
