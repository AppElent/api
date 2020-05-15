import { Subject } from 'rxjs';
import { basicAuthentication } from '../middleware/socketauthentication';

export let io: any;

export const allsockets = new Set();
export const sockets = new Subject();

export const init = (app: any, middleware?: Array<any>) => {
    const handleNewSocket = (socket: any) => {
        //logic
        //console.log(999, socket);
    };

    io = require('socket.io')(app); //eslint-disable-line

    io.use(basicAuthentication);

    io.on('connect', (socket: any) => {
        allsockets.add(socket);
        console.log('User connected (User: ' + socket.uid + ')');
        handleNewSocket(socket);

        socket.on('disconnect', () => {
            console.log('User disconnected');
            allsockets.delete(socket);
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

        sockets.next(socket);
    });
};
