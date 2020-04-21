'use strict';

require('dotenv').config();

const { getEnv } = require('./index'); // eslint-disable-line
const { Sequelize } = require('sequelize'); // eslint-disable-line

const env = getEnv(process.argv);

const settings = {
    development: {
        enelogic: {
            id: '5664_623x56if1d8o0gogsg40sg0ksgg8804skoc8s8gwsgwcoc8cc8',
            secret: process.env.ENELOGIC_LOCAL_SECRET,
            redirectUrl: 'http://localhost:3000/oauth/exchange/enelogic',
        },
        bunq: {
            redirectUrl: 'https://localhost:3000/oauth/exchange/bunq',
        },
    },
    herokudev: {
        enelogic: {
            id: '7215_2490w4fydvfow08ssww0ggss8084w4kkkkcggsggw88w00cwck',
            secret: process.env.ENELOGIC_DEV_SECRET,
            redirectUrl: 'https://dev.administratie.appelent.com/oauth/exchange/enelogic',
        },
        bunq: {
            redirectUrl: 'https://dev.administratie.appelent.com/oauth/exchange/bunq',
        },
    },
    herokustaging: {
        enelogic: {
            id: '7216_16ajgg19kark8csw4sss08400soccw4880o448w0cs040s00ow',
            secret: process.env.ENELOGIC_STAGING_SECRET,
            redirectUrl: 'https://staging.administratie.appelent.com/oauth/exchange/enelogic',
        },
        bunq: {
            redirectUrl: 'https://staging.administratie.appelent.com/oauth/exchange/bunq',
        },
    },
    herokuprod: {
        enelogic: {
            id: '7017_1ebfcn2fst9cgo8k0sow088ssk8skw4ckck8oo8wkgoc4cocg4',
            secret: process.env.ENELOGIC_PRODUCTION_SECRET,
            redirectUrl: 'https://administratie.appelent.com/oauth/exchange/enelogic',
        },
        bunq: {
            redirectUrl: 'https://administratie.appelent.com/oauth/exchange/bunq',
        },
    },
};

const oauthproviders = [
    {
        id: 'enelogic',
        defaultScope: 'account',
        flow: 'authorization',
        redirectUrl: settings[env].enelogic.redirectUrl,
        credentials: JSON.stringify({
            auth: { tokenHost: 'https://enelogic.com', tokenPath: '/oauth/v2/token', authorizePath: '/oauth/v2/auth' },
            client: {
                id: settings[env].enelogic.id,
                secret: settings[env].enelogic.secret,
            },
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'bunq',
        flow: 'authorization',
        redirectUrl: settings[env].bunq.redirectUrl,
        credentials: JSON.stringify({
            auth: { tokenHost: 'https://oauth.bunq.com', tokenPath: '/v1/token', authorizePath: '/auth' },
            client: {
                id: '5592ac7c4f9b6ea8807bae74665d23d528b0c1f2cb9f1195f8b7a0a29b18f728',
                secret: process.env.BUNQ_SECRET,
            },
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'tado',
        defaultScope: 'home.user',
        flow: 'password',
        credentials: JSON.stringify({
            auth: { tokenHost: 'https://auth.tado.com', tokenPath: '/oauth/token' },
            client: { id: 'tado-web-app', secret: 'wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc' },
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

module.exports = {
    up: queryInterface => {
        return queryInterface.bulkInsert('oauthproviders', oauthproviders);
    },

    down: queryInterface => {
        return queryInterface.bulkDelete('oauthproviders', null, {});
    },
};
