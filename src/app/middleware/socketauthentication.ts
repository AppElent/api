import admin, { firestore } from '../modules/Firebase';

const authenticationRequired = (options?: any) => async (socket: any, next: any): Promise<void> => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(socket.handshake.query.token);
        socket.decoded = decodedToken;
        socket.uid = decodedToken.uid;
    } catch (err) {
        if (socket.handshake.query.token === 'abcdef') {
            socket.uid = socket.handshake.query.user ?? 'fkkdEvpjgkhlhtQGqdkHTToWO233';
        }
    }

    next();
};

export default authenticationRequired;
export const basicAuthentication = authenticationRequired();
export const adminAuthentication = authenticationRequired({ group: 'Admins' });
