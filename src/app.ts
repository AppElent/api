import express, { Request, Response } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import bodyParser from 'body-parser';
import { lowerCaseQueryParams, create404Error, errorHandler } from './app/modules/express-collection';
import Bunq from './app/modules/Bunq';
import { logging, LoggerStream } from './app/modules/Logging';

import Sequelize, { User, Bunq as BunqModel, migrator, seeder } from './app/models';

/**
 * Application cache
 */
import _ from 'lodash';
export const appData: any = {};
export const setAppData = (key: string, value: any): void => {
    _.set(appData, key, value);
};
export const getAppData = (key: string): any => {
    return _.get(appData, key);
};

//Load firebase
import { firestore, auth } from './app/modules/Firebase';

/* Database configuratie */
// force: true will drop the table if it already exists
const forceUpdate = process.env.NODE_ENV === 'test' ? true : false;
Sequelize.sync({ force: forceUpdate }).then(async () => {
    logging.info('Sync sequelize models with { force: ' + forceUpdate + ' }');

    /**
     * Run migrator and seeder
     */
    try {
        if (!forceUpdate) {
            const pendingMigrations = await migrator.pending();
            if (pendingMigrations.length > 0) {
                logging.info('There are ' + pendingMigrations.length + ' migrations pending');
                console.log(pendingMigrations);
                await migrator.up();
            }
        }

        if (
            process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'test' ||
            process.env.HEROKU_ENV === 'development'
        ) {
            Sequelize.options.logging = false;
            const revert = await seeder.down({ to: 0 });
            const pendingSeeders = await seeder.pending();
            if (pendingSeeders.length > 0) {
                logging.info('Seeding: ' + pendingSeeders.length + ' seeders will be executed.');
                await seeder.up();
            }
            Sequelize.options.logging = logging.info.bind(logging);
        }
    } catch (error) {
        logging.error('Error running migration and/or seeder. See below for details');
        console.log(error);
    }

    /**
     * Create all users who not exist in database (from firebase)
     */
    /*
    const listAllUsers = (nextPageToken?: string) => {
        // List batch of users, 1000 at a time.
        auth.listUsers(1000, nextPageToken)
            .then(listUsersResult => {
                listUsersResult.users.forEach(async userRecord => {
                    const user: any = userRecord.toJSON();
                    const object = {
                        uid: user.uid,
                        name: user.displayName,
                        email: user.email,
                        lastlogon: user.metadata.lastSignInTime,
                    };
                    const founduser = await User.findByPk(user.uid);
                    await firestore
                        .doc('/user-claims/' + user.uid)
                        .set({ uid: user.uid, displayName: user.displayName, email: user.email });
                    if (founduser) {
                        logging.info('User ' + user.uid + ' is updated');
                        await founduser.update(object);
                    } else {
                        logging.info('User ' + user.uid + ' is created');
                        await User.create(object);
                    }
                });
                if (listUsersResult.pageToken) {
                    // List next batch of users.
                    listAllUsers(listUsersResult.pageToken);
                }
            })
            .catch(function(error) {
                console.log('Error listing users:', error);
            });
    };
    // Start listing users from the beginning, 1000 at a time.
    listAllUsers();
    */
    firestore.collection('/user-claims').onSnapshot(querySnapshot => {
        querySnapshot.forEach(async (user: any) => {
            const userdata = user.data();
            const object = {
                uid: userdata.uid,
                name: userdata.displayName,
                email: userdata.email,
            };
            const founduser = await User.findByPk(user.id);
            if (founduser) {
                logging.info('User ' + userdata.uid + ' is updated');
                await founduser.update(object);
            } else {
                logging.info('User ' + userdata.uid + ' is created');
                await User.create(object);
            }
        });
    });

    /*
    /**
     * Bunq clients laden
     * inclusief genericClient
     
    const bunq = new Bunq(path.resolve(__dirname, './config/bunq'));
    // Generieke client starten
    bunq.loadGenericClient();

    //laden van de BUNQ clients
    (async (): Promise<void> => {
        //alle clients laden
        const allclients = await BunqModel.findAll();
        if (allclients.length === 0) return;
        //eerste client laden
        const client1 = allclients.shift();
        logging.info('Eerste client laden', client1.userId);
        try {
            await bunq.load(client1.userId, client1.access_token, client1.encryption_key, client1.environment, {});
            //const requestLimiter = bunq.getClient(client1.userId).getBunqJSClient().ApiAdapter.RequestLimitFactory;
        } catch (err) {
            await client1.destroy();
            logging.info('Error loading client ' + client1.userId);
        }

        //rest laden
        await Promise.all(
            allclients.map(async (clientsetting: any) => {
                logging.info('loading client ' + clientsetting.userId);
                try {
                    await bunq.load(
                        clientsetting.userId,
                        clientsetting.access_token,
                        clientsetting.encryption_key,
                        clientsetting.environment,
                        {},
                    );
                    //await bunq.load(clientsetting.userId, clientsetting.data1, clientsetting.access_token, clientsetting.refresh_token, { environment: 'PRODUCTION', requestLimiter: requestLimiter });
                    logging.info('client loaded ' + clientsetting.userId);
                } catch (err) {
                    await clientsetting.destroy();
                    logging.info('Error loading client ' + clientsetting.userId);
                }
            }),
        );
    })();
    setAppData('bunq', bunq);
    */
});

// import Oauth module and load into cache
import OAuth from './app/modules/Oauth';
const fireStoreEnv = process.env.HEROKU_ENV ?? 'local';
firestore
    .collection('env/' + fireStoreEnv + '/oauthproviders')
    .get()
    // eslint-disable-next-line
    .then((providers: any) => {
        setAppData('oauth', {});
        // eslint-disable-next-line
        providers.forEach((provider: any) => {
            const data = provider.data();
            logging.info('OAuth provider ' + provider.id + ' loaded');
            const oauthprovider = new OAuth(data);
            setAppData('oauth.' + provider.id, oauthprovider);
        });
    });
const app = express();
export default app;

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(logger('dev', { stream: new LoggerStream() }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../client/build')));

/* Express configuration */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Parses JSON in body
app.use(lowerCaseQueryParams); // Makes all query params lowercase

app.get('/health-check', (req: Request, res: Response) => res.sendStatus(200)); //certificate route & simple health check

import './app/routes';

app.use(create404Error); //If route isnt found throw 404
app.use(errorHandler(logging.error)); // If error throw Error object
