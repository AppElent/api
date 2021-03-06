import admin, { firestore } from '../modules/Firebase';
import { Request, Response, NextFunction } from 'express';
import { logging } from '../modules/Logging';

interface CustomRequest extends Request {
    headers: any;
    uid?: string;
    jwt?: any;
}

const checkAuthenticated = async (req: CustomRequest, res: Response, options: any = {}): Promise<void | any> => {
    //Checken of er een custom token is
    //const token = "homebridge-authenticated"
    const authHeader = req.headers.authorization || '';
    //console.log(req.headers);
    /*
    const apimatch = authHeader.match(/Apitoken (.+)/);
    const remoteIP = req.socket.remoteAddress;
    if (!apimatch && options.token !== undefined) return { result: false, message: 'No API token given' };
    if (apimatch && options.token) {
        const accessToken = apimatch[1];
        console.log(accessToken, remoteIP, remoteIP.endsWith('192.168.178.1'));
        const localaddress = remoteIP.endsWith('192.168.178.1') ? true : false;
        if (localaddress === false) return { result: false, message: 'No local address' };
        if (accessToken !== options.token) return { result: false, message: 'Token doesnt match' };
        return { result: true, jwt: false, uid: '', message: 'apimatch' };
        //return res.status(401).end();
    }
    */

    // Check for firebase authentication.
    const firebasematch = authHeader.match(/Firebase (.+)/);
    if (firebasematch) {
        const firebaseToken = firebasematch[1];
        try {
            const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
            if (options.group) {
                console.log('Group: ' + options.group);
            }
            return {
                result: true,
                jwt: decodedToken,
                uid: decodedToken.uid,
                type: 'Firebase token',
                message: 'Firebase authentication succesful',
            };
        } catch (err) {
            return { result: false, message: err, type: 'Firebase token' };
        }
    }

    // Check for API key
    if (req.query.api_key) {
        if (req.query.api_key !== 'abcdef') {
            return {
                result: false,
                type: 'API Key',
                message: 'API key was given with query param but not found in database',
            };
        }
        /*
        const userdoc = await firestore
            .collection('env')
            .doc(process.env.REACT_APP_FIRESTORE_ENVIRONMENT)
            .collection('users')
            .where('api.key', '==', req.query.api_key)
            .limit(1)
            .get();
        if (userdoc.empty)
            return { result: false, message: 'API key was given with query param but not found in database' };
        const doc = userdoc.docs[0];
        */
        return {
            result: true,
            uid: req.query.user ?? 'fkkdEvpjgkhlhtQGqdkHTToWO233',
            message: 'API key authentication succesful',
            type: 'API Key',
        };
    }

    // Dev environment no authentication required
    if (process.env.NODE_ENV === 'development' || process.env.HEROKU_ENV === 'development') {
        const uid = req.query.user ?? 'fkkdEvpjgkhlhtQGqdkHTToWO233';
        return {
            result: true,
            uid,
            message: 'No authentication, environment=development.',
            type: 'Development (no auth)',
        };
    }

    return { result: false, message: 'No authentication present', type: 'No auth' };
};

const authenticationRequired = (options?: any) => (req: CustomRequest, res: Response, next: NextFunction): void => {
    checkAuthenticated(req, res, options).then((authenticated: any) => {
        if (authenticated.result === true) {
            req.jwt = authenticated.jwt;
            if (!authenticated.uid) {
                throw new Error('Succesful authentication but no user found.');
            }
            const uid = authenticated.uid;
            logging.info('User ' + uid + ' successfully authenticated (type: ' + authenticated.type + ')');
            req.uid = uid;
            next();
        } else {
            logging.error('Authentication failed (' + authenticated.type + '): ' + authenticated.message);
            return res.status(401).send({ success: false, statuscode: 401, message: authenticated.message });
        }
    });
};

export default authenticationRequired;
export const basicAuthentication = authenticationRequired();
export const adminAuthentication = authenticationRequired({ group: 'Admins' });
