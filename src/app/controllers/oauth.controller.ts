/* eslint-disable @typescript-eslint/camelcase */
import express, { Request, Response } from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';

import Cache from '../modules/Cache';
import Encryption from '../modules/Encryption';

const encryption = new Encryption();
const key = encryption.generateRandomKey(32);

import { getAppData } from '../../app';
import { basicAuthentication } from '../middleware/authentication';
import { cacheMiddleware, asyncHandler } from '../modules/express-collection';
import { logging } from '../modules/Logging';

const oauthCache = new Cache();

/**
 * Format the OAuth Url
 * @param req Request object from Express
 * @param res Response object from Express
 */
const formatUrl = (req: Request, res: Response): Response => {
    const oauthobject = getAppData('oauth.' + req.params.application);

    if (!oauthobject) {
        throw new Error('OauthProvider ' + req.params.application + ' not found!');
    }

    // Authorization oauth2 URI
    const token = jwt.sign(
        {
            //exp: Math.floor(Date.now() / 1000) + 60,
            timestamp: new Date(),
            origin: req.headers.referer,
        },
        key,
    );
    const authorizationUri = oauthobject.formatUrl(token);
    return res.send(authorizationUri);
};

/**
 * Exchange Oauth tokens
 * @param req Request object from Express
 * @param res Response object from Express
 */
const exchange = async (req: Request, res: Response): Promise<Response> => {
    const oauthobject = getAppData('oauth.' + req.params.application);

    if (!oauthobject) {
        throw new Error('OauthProvider ' + req.params.application + ' not found!');
    }
    let decoded;
    if (req.body.state) {
        logging.info('State paramter is' + req.body.state);
        try {
            decoded = jwt.verify(req.body.state, key);
        } catch (err) {
            logging.error('Unable to verify JWT');
            return res.status(400).send({ success: false, message: err });
        }
    }

    // Save the access token
    let getTokenConfig: any;
    if (oauthobject.flow === 'authorization') {
        getTokenConfig = { code: req.body.code, state: decoded };
    } else if (oauthobject.flow === 'password') {
        getTokenConfig = { username: req.body.username, password: req.body.password };
    }
    try {
        const accessToken = await oauthobject.getToken(getTokenConfig);
        const accessTokenObject = {
            access_token: accessToken.token.access_token,
            expires_at: accessToken.token.expires_at,
            expires_in: accessToken.token.expires_in,
            refresh_token: accessToken.token.refresh_token,
            scope: accessToken.token.scope,
            token_type: accessToken.token.token_type,
        };
        return res.send({ success: true, data: { token: accessTokenObject, state: decoded } });
    } catch (error) {
        console.log(error.message, error.output);
        return res.status(400).send({ success: false, message: error.message, output: error.output });
    }
};

/**
 * Receiver
 * @param req
 * @param res
 */
const receiver = async (req: Request, res: Response): Promise<Response | void> => {
    const oauthobject = getAppData('oauth.' + req.params.application);
    if (!oauthobject) {
        throw new Error('OauthProvider ' + req.params.application + ' not found!');
    }

    if (!req.query.code) {
        return res.status(400).send({
            success: false,
            message: 'No code preent',
        });
    }
    if (!req.query.state) {
        return res.status(400).send({
            success: false,
            message: 'No state preent',
        });
    }
    if (req.body.state) {
        logging.info('State parameter is' + req.body.state);
        try {
            const decoded: any = jwt.verify(req.query.state as string, key);
            if (decoded.redirectUrl) {
                return res.redirect(decoded.redirectUrl);
            }
        } catch (err) {
            logging.error('Unable to verify JWT');
            return res.status(400).send({ success: false, message: err });
        }
    }
};

/**
 * Refresh oauth token
 * @param req Request object from Express
 * @param res Response object from Express
 */
const refresh = async (req: Request, res: Response): Promise<Response> => {
    const oauthobject = getAppData('oauth.' + req.params.application);

    if (!oauthobject) {
        throw new Error('OauthProvider ' + req.params.application + ' not found!');
    }
    try {
        const accessToken = await oauthobject.refresh(req.body);
        const accessTokenObject = {
            access_token: accessToken.token.access_token,
            expires_at: accessToken.token.expires_at,
            expires_in: accessToken.token.expires_in,
            refresh_token: accessToken.token.refresh_token,
            scope: accessToken.token.scope,
            token_type: accessToken.token.token_type,
        };
        return res.send({ success: true, data: { token: accessTokenObject } });
    } catch (error) {
        console.log(error);
        return res.status(400).send({ success: false, message: error.message, output: error.output });
    }
};

router.use(basicAuthentication);
router.get('/formatUrl/:application', cacheMiddleware(oauthCache, { log: true, logger: logging.info }), formatUrl);
router.post('/exchange/:application', asyncHandler(exchange));
router.post('/refresh/:application', asyncHandler(refresh));

export default router;
