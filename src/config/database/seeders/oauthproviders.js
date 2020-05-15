'use strict';

require('dotenv').config();

const { generateRandomKey, getEnv, getEncryptionString, getEncryptionValue } = require('./index'); // eslint-disable-line
const { Sequelize } = require('sequelize'); // eslint-disable-line

const env = getEnv(process.argv);

const settings = {
    development: {
        baseUri: 'http://localhost:3000',
        enelogic: {
            id: '5664_623x56if1d8o0gogsg40sg0ksgg8804skoc8s8gwsgwcoc8cc8',
            secret: process.env.ENELOGIC_LOCAL_SECRET,
        },
        bunq: {
            redirectUrl: 'https://localhost:3000/oauth/exchange/bunq',
        },
        microsoft: {
            redirectUrl: 'http://localhost:3000/oauth/exchange/microsoft',
        },
        encryptionKey: process.env.SEQUELIZE_ENCRYPTION_KEY,
    },
    herokudev: {
        baseUri: 'https://dev.administratie.appelent.com',
        enelogic: {
            id: '7215_2490w4fydvfow08ssww0ggss8084w4kkkkcggsggw88w00cwck',
            secret: process.env.ENELOGIC_DEV_SECRET,
        },
        encryptionKey: process.env.ENCRYPTION_KEY_DEV,
    },
    herokustaging: {
        baseUri: 'https://staging.administratie.appelent.com',
        enelogic: {
            id: '7216_16ajgg19kark8csw4sss08400soccw4880o448w0cs040s00ow',
            secret: process.env.ENELOGIC_STAGING_SECRET,
        },
        encryptionKey: process.env.ENCRYPTION_KEY_STAGING,
    },
    herokuprod: {
        baseUri: 'https://administratie.appelent.com',
        enelogic: {
            id: '7017_1ebfcn2fst9cgo8k0sow088ssk8skw4ckck8oo8wkgoc4cocg4',
            secret: process.env.ENELOGIC_PRODUCTION_SECRET,
        },
        encryptionKey: process.env.ENCRYPTION_KEY_PROD,
    },
};

const environmentSetting = settings[env];

const encryptionKey = environmentSetting.encryptionKey;

const oauthproviders = [
    {
        id: 'enelogic',
        defaultScope: 'account',
        flow: 'authorization',
        redirectUrl: environmentSetting.baseUri + '/oauth/exchange/enelogic',
        credentials: getEncryptionString(
            JSON.stringify({
                auth: {
                    tokenHost: 'https://enelogic.com',
                    tokenPath: '/oauth/v2/token',
                    authorizePath: '/oauth/v2/auth',
                },
                client: {
                    id: settings[env].enelogic.id,
                    secret: settings[env].enelogic.secret,
                },
            }),
            encryptionKey,
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'bunq',
        flow: 'authorization',
        redirectUrl: environmentSetting.baseUri + '/oauth/exchange/bunq',
        credentials: getEncryptionString(
            JSON.stringify({
                auth: { tokenHost: 'https://oauth.bunq.com', tokenPath: '/v1/token', authorizePath: '/auth' },
                client: {
                    id: '5592ac7c4f9b6ea8807bae74665d23d528b0c1f2cb9f1195f8b7a0a29b18f728',
                    secret: process.env.BUNQ_SECRET,
                },
                options: {
                    bodyFormat: 'json',
                },
            }),
            encryptionKey,
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'tado',
        defaultScope: 'home.user',
        flow: 'password',
        credentials: getEncryptionString(
            JSON.stringify({
                auth: { tokenHost: 'https://auth.tado.com', tokenPath: '/oauth/token' },
                client: {
                    id: 'tado-web-app',
                    secret: 'wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc',
                },
            }),
            encryptionKey,
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'microsoft',
        defaultScope: 'openid profile offline_access user.read mail.readwrite mailboxsettings.readwrite',
        flow: 'authorization',
        redirectUrl: environmentSetting.baseUri + '/oauth/exchange/microsoft',
        credentials: getEncryptionString(
            JSON.stringify({
                auth: {
                    tokenHost: 'https://login.microsoftonline.com',
                    tokenPath: '/common/oauth2/v2.0/token',
                    authorizePath: '/common/oauth2/v2.0/authorize',
                },
                client: {
                    id: '617c077e-9051-4972-ad34-eed0417950e1',
                    secret: process.env.MICROSOFT_SECRET,
                },
            }),
            encryptionKey,
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'google',
        defaultScope: 'https://www.googleapis.com/auth/drive',
        flow: 'authorization',
        redirectUrl: environmentSetting.baseUri + '/oauth/exchange/google',
        credentials: getEncryptionString(
            JSON.stringify({
                auth: {
                    tokenHost: 'https://oauth2.googleapis.com',
                    tokenPath: '/token',
                    authorizeHost: 'https://accounts.google.com',
                    authorizePath: '/o/oauth2/v2/auth',
                },
                client: {
                    id: '909589468874-8h29vvvfo00hlesu85hdq2fg3nv6ch3s.apps.googleusercontent.com',
                    secret: process.env.GOOGLE_SECRET,
                },
            }),
            encryptionKey,
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

module.exports = {
    up: async queryInterface => {
        await queryInterface.bulkDelete('oauthproviders', null, {});
        return queryInterface.bulkInsert('oauthproviders', oauthproviders);
    },

    down: queryInterface => {
        return queryInterface.bulkDelete('oauthproviders', null, {});
    },
};
