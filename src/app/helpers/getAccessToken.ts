import { appData, getAppData, setAppData } from '../../app';
import { firestore } from '../modules/Firebase';
import { Token } from 'simple-oauth2';
import saveAccessToken from './saveAccessToken';

const getAccessToken = async (
    uid: string,
    application: string,
    refreshIfExpired = false,
): Promise<Token | undefined> => {
    let token = getAppData('tokens.' + uid + '.' + application);
    if (!token) {
        const userdocument = await firestore.doc('/env/' + process.env.HEROKU_ENV + '/users/' + uid).get();
        if (userdocument.exists) {
            token = userdocument.data()[application]?.token;
            if (token) {
                setAppData('tokens.' + uid + '.' + application, token);
            }
        }
    }
    if (refreshIfExpired) {
        const oauthobject = getAppData('oauth.' + application);
        const accessToken = await oauthobject.refresh(token, {
            force: false,
            saveFunction: saveAccessToken(application, uid),
        });
        if (accessToken) setAppData('tokens.' + uid + '.' + application, accessToken.token);
    }
    return token;
};

export default getAccessToken;
