/* eslint-disable @typescript-eslint/camelcase */
import express, { Response } from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';

import Cache from '../modules/Cache';
import Encryption from '../modules/Encryption';

const encryption = new Encryption();
const key = encryption.generateRandomKey(32);

import { appData, getAppData, setAppData } from '../../app';
import { basicAuthentication } from '../middleware/authentication';
import { cacheMiddleware, asyncHandler } from '../modules/express-collection';
import { logging } from '../modules/Logging';
import OAuth, { CustomOptions } from '../modules/Oauth';
import { OauthProvider } from '../models';
import saveAccessToken from '../helpers/saveAccessToken';
import { CustomRequest } from '../types/CustomRequest';
import { sockets } from '../modules/SocketIO';

const oauthCache = new Cache();

const searchedForProvider: Array<string> = [];

sockets.subscribe((socket: any) => {
    socket.on('test1234', console.log);
});

const loadOauthProvider = async (key: string): Promise<InstanceType<typeof OAuth>> => {
    const oauthobject = getAppData('oauth.' + key);
    if (oauthobject) {
        return oauthobject;
    }
    if (searchedForProvider.includes(key)) {
        logging.info('OAuth provider not found and already searched for.');
        throw new Error('OauthProvider ' + key + ' not found! (tried more than once)');
    }
    const provider = await OauthProvider.findByPk(key);
    if (provider) {
        logging.info('OAuth provider ' + provider.id + ' loaded');
        const { credentials, redirectUrl, defaultScope, flow } = provider;
        const oauthprovider = new OAuth(JSON.parse(credentials), { redirectUrl, flow, defaultScope } as CustomOptions);
        setAppData('oauth.' + provider.id, oauthprovider);
        return oauthprovider;
    } else {
        searchedForProvider.push(key);
        throw new Error('OauthProvider ' + key + ' not found!');
    }
};

/**
 * Format the OAuth Url
 * @param req Request object from Express
 * @param res Response object from Express
 */
const formatUrl = async (req: CustomRequest, res: Response): Promise<Response> => {
    const oauthobject = await loadOauthProvider(req.params.application);

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
const exchange = async (req: CustomRequest, res: Response): Promise<Response> => {
    const oauthobject = await loadOauthProvider(req.params.application);

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

    if (req.params.application.toLowerCase() === 'bunq') {
        const bunqClient = getAppData('bunq').getGenericClient();
        const authorizationCode = await bunqClient.exchangeOAuthToken(
            oauthobject.credentials.client.id,
            oauthobject.credentials.client.secret,
            oauthobject.redirectUrl,
            req.body.code,
        );
        await saveAccessToken(req.params.application, req.uid)(authorizationCode);
        return res.send({ success: true, data: { token: authorizationCode, state: decoded } });
    }

    // Save the access token
    let getTokenConfig: any;
    if (oauthobject.flow === 'authorization') {
        getTokenConfig = { code: req.body.code, state: decoded };
    } else if (oauthobject.flow === 'password') {
        getTokenConfig = { username: req.body.username, password: req.body.password };
    }
    try {
        const accessToken = await oauthobject.getToken(
            getTokenConfig,
            saveAccessToken(req.params.application, req.uid),
        );
        console.log(accessToken.token);
        setAppData('tokens.' + req.uid + '.' + req.params.application, accessToken.token);
        return res.send({ success: true, data: { token: accessToken.token, state: decoded } });
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
const receiver = async (req: CustomRequest, res: Response): Promise<Response | void> => {
    const oauthobject = await loadOauthProvider(req.params.application);

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
const refresh = async (req: CustomRequest, res: Response): Promise<Response> => {
    const oauthobject = await loadOauthProvider(req.params.application);
    const { force, token } = req.body;
    try {
        const accessToken = await oauthobject.refresh(token, {
            force,
            saveFunction: saveAccessToken(req.params.application, req.uid),
        });
        if (!accessToken) {
            return res.send({ success: true, data: req.body });
        }
        setAppData('tokens.' + req.uid + '.' + req.params.application, accessToken.token);
        return res.send({ success: true, data: { token: accessToken.token } });
    } catch (error) {
        logging.error(error);
        return res.status(400).send({ success: false, message: error.message, output: error.output });
    }
};

router.use(basicAuthentication);
router.get(
    '/formatUrl/:application',
    cacheMiddleware(oauthCache, { log: true, logger: logging.info }),
    asyncHandler(formatUrl),
);
router.post('/exchange/:application', asyncHandler(exchange));
router.post('/refresh/:application', asyncHandler(refresh));

export default router;
