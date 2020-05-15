import { Token } from 'simple-oauth2';
import { firestore } from '../modules/Firebase';
import { setAppData } from '../../app';

const saveAccessToken = (application: string, user: string) => async (accesstoken: Token): Promise<void> => {
    if (accesstoken.expires_at) {
        setAppData('tokens.' + user + '.' + application, accesstoken);
        await firestore
            .doc('/env/' + process.env.HEROKU_ENV + '/users/' + user)
            .update(application + '.token', accesstoken);
    }
};

export default saveAccessToken;
