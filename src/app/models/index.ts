import { Sequelize } from 'sequelize';
import pg from 'pg';
import Umzug from 'umzug';

import configs from './../../config/database';
import sequelizerc from '../../config/database/sequelizerc';
import { logging } from '../modules/Logging';
const anyConfigs: any = configs;
const config: any = anyConfigs[process.env.NODE_ENV];

let sequelize: any;
if (config.use_env_variable) {
    if (config.ssl) {
        pg.defaults.ssl = config.ssl;
    }
    sequelize = new Sequelize(process.env[config.use_env_variable], { logging: false });
} else if (config.dialect === 'sqlite') {
    sequelize = new Sequelize({
        database: config.database,
        username: config.username,
        password: config.password,
        dialect: config.dialect,
        storage: config.storage,
        dialectOptions: config.dialectOptions,
        logging: logging.info.bind(logging),
    });
}

export const migrator = new Umzug({
    migrations: {
        path: sequelizerc['migrations-path'],
        params: [sequelize.getQueryInterface()],
    },
    storage: 'sequelize',
    storageOptions: { sequelize },
});

export const seeder = new Umzug({
    migrations: {
        path: sequelizerc['seeders-path'],
        params: [sequelize.getQueryInterface()],
    },
    storage: 'sequelize',
    storageOptions: { sequelize, modelName: 'SequelizeData' },
});

const db: any = {};
//db.sequelize = sequelizeconnection;
export default sequelize;
//export default sequelizeconnection;

export { default as User } from './users.model';
export { default as Bunq } from './bunq.model';
export { default as Demo } from './demo.model';
export { default as Events } from './events.model';
export { default as Meterstanden } from './meterstanden.model';

/*
fs.readdirSync(__dirname)
    .filter(
        file =>
            file.indexOf('.') !== 0 &&
            file.indexOf('index') === -1 &&
            (file.slice(-3) === '.ts' || file.slice(-3) === '.js'),
    )
    .forEach(file => {
        const model: any = sequelizeconnection.import(__dirname + '/' + file);
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});
*/

/*
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = configs[env];
const db: any = {};

let sequelize: any;
if (config.use_env_variable) {
    if (config.ssl) {
        pg.defaults.ssl = true;
    }
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    console.log(config);
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
    .filter(file => {
        return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
    })
    .forEach(file => {
        const modelname = file.replace('.model.js', '');
        db[modelname] = require('./' + file)(sequelize, Sequelize);
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
*/
