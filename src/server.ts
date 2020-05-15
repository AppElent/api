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
import http from 'http';

//app.set('port', httpsPort);
const server = http.createServer(app);
import { io, init } from './app/modules/SocketIO';
init(server);
/*
io.on('connection', (socket: any) => {
    console.log('a user connected', socket.handshake.query);

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('test', console.log);

    function timeout(time: number) {
        setTimeout(function() {
            // Do Something Here
            // Then recall the parent function to
            // create a recursive loop.
            socket.emit('time', new Date());
            timeout(time);
        }, time);
    }
    //timeout(1000);
});
*/

server.listen(httpPort);
server.on('error', onError);
server.on('listening', onListening);

//app.listen(httpPort);
