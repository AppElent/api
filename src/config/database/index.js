const dotenv = require('dotenv'); // eslint-disable-line
dotenv.config();

module.exports = {
    development: {
        database: 'mainDB',
        username: null,
        password: null,
        dialect: 'sqlite',
        storage: './database.sqlite',
    },
    test: {
        database: 'mainDB',
        username: '',
        password: '',
        dialect: 'sqlite',
        storage: './database_test.sqlite',
    },
    productionOld: {
        ssl: true,
        // eslint-disable-next-line
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectOptions: {
            ssl: true,
        },
    },
    herokudev: {
        ssl: {
            rejectUnauthorized: false,
        },
        // eslint-disable-next-line
        use_env_variable: 'DATABASE_URL_DEV',
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false,
            },
        },
    },
    herokustaging: {
        ssl: {
            rejectUnauthorized: false,
        },
        // eslint-disable-next-line
        use_env_variable: 'DATABASE_URL_STAGING',
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false,
            },
        },
    },
    herokuprod: {
        ssl: {
            rejectUnauthorized: false,
        },
        // eslint-disable-next-line
        use_env_variable: 'DATABASE_URL_PROD',
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false,
            },
        },
    },
    production: {
        ssl: {
            rejectUnauthorized: false,
        },
        // eslint-disable-next-line
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false,
            },
        },
    },
};
