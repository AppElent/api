import express, { Response } from 'express';
const router = express.Router();
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

import { basicAuthentication } from '../middleware/authentication';
import { asyncHandler } from '../modules/express-collection';
import getAccessToken from '../helpers/getAccessToken';
import { CustomRequest } from '../types/CustomRequest';

const getProfile = async (req: CustomRequest, res: Response): Promise<Response> => {
    try {
        let token: string = req.query.access_token as string;
        if (!req.query.access_token) {
            token = (await getAccessToken(req.uid, 'microsoft', true)).access_token;
        }
        if (!token) {
            return res.status(400).send('No access_token present or supplied');
        }
        const client = Client.init({
            authProvider: done => {
                done(null, token); //first parameter takes an error if you can't get an access token
            },
        });
        const profile = await client.api('/me').get();
        return res.send(profile);
    } catch (err) {
        console.log(err);
        throw new Error(err);
    }
};

router.use(basicAuthentication);
router.get('/profile', asyncHandler(getProfile));

export default router;
