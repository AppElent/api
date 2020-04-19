import express, { Request, Response } from 'express';
const router = express.Router();
import axios from 'axios';

import { basicAuthentication } from '../middleware/authentication';
import { asyncHandler } from '../modules/express-collection';

const host = 'https://my.tado.com';

// Initialize the OAuth2 Library
/*
const tado_oauth = require('simple-oauth2').create(credentials);

async function getAccessToken(tado_oauth, tokenConfig) {
    try {
        const result = await tado_oauth.ownerPassword.getToken(tokenConfig);
        return await tado_oauth.accessToken.create(result);
    } catch (error) {
        console.log('Access Token Error', error.message);
        return undefined;
    }
}

async function refreshAccessToken() {
    // Check if the token is expired. If expired it is refreshed.
    if (accessToken.expired()) {
        try {
            accessToken = await accessToken.refresh();
        } catch (error) {
            console.log('Error refreshing access token: ', error.message);
        }
    }
}

var accessToken = '';
//getAccessToken(tado_oauth, tokenConfig).then(data => {accessToken = data;});

const test = async (req, res) => {
    const url = 'https://my.tado.com/api/v1/me';
    await refreshAccessToken();
    const data = await fetching.makeAPICall(url, 'GET', null, accessToken.token.access_token);

    res.send({ data, accessToken });
};
*/

const me = async (req: Request, res: Response): Promise<Response> => {
    const url = host + '/api/v2/me';
    const data = await axios.get(url, { headers: { Authorization: 'Bearer ' + req.query.access_token } });
    return res.send({ success: true, data: data.data });
};

const homes = async (req: Request, res: Response): Promise<Response> => {
    const url = host + '/api/v2/homes/' + req.params.home;
    const data = await axios.get(url, { headers: { Authorization: 'Bearer ' + req.query.access_token } });
    return res.send({ success: true, data: data.data });
};

const zones = async (req: Request, res: Response): Promise<Response> => {
    const url = host + '/api/v2/homes/' + req.params.home + '/zones';
    const data = await axios.get(url, { headers: { Authorization: 'Bearer ' + req.query.access_token } });
    return res.send({ success: true, data: data.data });
};

const state = async (req: Request, res: Response): Promise<Response> => {
    const url = host + '/api/v2/homes/' + req.params.home + '/zones/' + req.params.zone + '/state';
    const data = await axios.get(url, { headers: { Authorization: 'Bearer ' + req.query.access_token } });
    return res.send({ success: true, data: data.data });
};

const report = async (req: Request, res: Response): Promise<Response> => {
    const url =
        host + '/api/v2/homes/' + req.params.home + '/zones/' + req.params.zone + '/dayReport/?date=' + req.params.date;
    const data = await axios.get(url, { headers: { Authorization: 'Bearer ' + req.query.access_token } });
    return res.send({ success: true, data: data.data });
};

router.use(basicAuthentication);
router.get('/me', asyncHandler(me));
router.get('/homes/:home', asyncHandler(homes));
router.get('/homes/:home/zones', asyncHandler(zones));
router.get('/homes/:home/zones/:zone/report/:date', asyncHandler(report));
router.get('/state/:zone/', asyncHandler(state));
export default router;
