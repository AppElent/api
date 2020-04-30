import dotenv from 'dotenv';
import { httpRedirect as httpRedirectMiddleware, onListening, onError } from './app/modules/express-collection';
import { logging } from './app/modules/Logging';

dotenv.config();

const NODE_ENV: string = (process.env.NODE_ENV || 'development').toLowerCase();

logging.info('Starting application (environment: ' + NODE_ENV + ')');

import configs from './config/database';
const anyConfigs: any = configs;
const config: any = anyConfigs[NODE_ENV];
if (!config) {
    logging.error('No environment with name ' + NODE_ENV + ' found');
    throw 'No environment with name ' + NODE_ENV + ' found';
}

process.env.NODE_ENV = NODE_ENV;

const httpPort = process.env.PORT ?? 3001;
const httpsPort = process.env.HTTPS_PORT ?? 3002;

logging.info('HTTP Poort: ' + httpPort);
logging.info('HTTPS Poort: ' + httpsPort);

import app from './app';
//TODO: const debug = require('debug')('backend:server');
import https from 'https';

app.set('port', httpsPort);
const server = https.createServer({}, app);

server.listen(httpsPort);
server.on('error', onError);
server.on('listening', onListening);

app.listen(httpPort);
