import express, { Request, Response } from 'express';
const router = express.Router();

import Cache from '../modules/Cache';
import { basicAuthentication } from '../middleware/authentication';
import { cacheMiddleware, asyncHandler } from '../modules/express-collection';
import { getAppData } from '../../app';

import { google } from 'googleapis';

const listFiles = async (req: Request, res: Response): Promise<Response> => {
    const oauthobject = getAppData('oauth.google');
    const oauth2Client = new google.auth.OAuth2(
        oauthobject.credentials.client.id,
        oauthobject.credentials.client.secret,
        oauthobject.redirectUrl,
    );
    oauth2Client.setCredentials(JSON.parse(req.query.access_token as string));
    const drive = google.drive({
        version: 'v3',
        auth: oauth2Client,
    });
    const files = await drive.files.list({
        pageSize: 10,
    });
    return res.send({ success: true, data: files });
};

router.use(basicAuthentication);
router.get('/files', asyncHandler(listFiles));

export default router;
