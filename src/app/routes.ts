import { Request, Response } from 'express';
import path from 'path';
//import fs from 'fs';
import app from '../app';
//import { logging } from '../server';

//
//import Cache from 'simple-cache-js';

//Load all controllers
//TODO
/*
    const path = require('path');
    const fs = require('fs');
    const normalizedPath = path.join(__dirname, './controllers');
    const controllers = {};
    fs.readdirSync(normalizedPath).forEach(function(file) {
        const controllername = file.replace('.controller.js', '');
        const stats = fs.statSync(normalizedPath + '/' + file);
        if (stats.isFile()) controllers[controllername] = require('./controllers/' + file);
        console.log('Controller ' + file + ' wordt geladen');
    });

    //Custom routes
    app.use('/api/custom', controllers.custom);
    app.get('/api/test', basicAuthentication, (req, res) => {
        res.send({ result: true, asd: false });
    });

    //Rekeningen
    app.get('/api/rekeningen/:id', basicAuthentication, get(db.rekeningen));
    app.get('/api/rekeningen', basicAuthentication, list(db.rekeningen));
    app.get('/api/rekeningen/:column/:value', basicAuthentication, find(db.rekeningen));
    app.post('/api/rekeningen', basicAuthentication, create(db.rekeningen));
    app.put('/api/rekeningen/:id', basicAuthentication, update(db.rekeningen));
    app.delete('/api/rekeningen/:id', basicAuthentication, destroy(db.rekeningen));

    //Meterstanden
    const meterstandCache = new Cache(300);
    app.get('/api/meterstanden/:id', basicAuthentication, get(db.meterstanden));
    app.get('/api/meterstanden', basicAuthentication, list(db.meterstanden, { cache: meterstandCache }));
    app.get('/api/meterstanden/:column/:value', basicAuthentication, find(db.meterstanden));
    app.post('/api/meterstanden', basicAuthentication, create(db.meterstanden));
    app.put('/api/meterstanden/:id', basicAuthentication, update(db.meterstanden));

    //Events
    app.get('/api/events/:id', basicAuthentication, get(db.events));
    app.get('/api/events', basicAuthentication, list(db.events));
    app.get('/api/events/:column/:value', basicAuthentication, find(db.events));
    app.post('/api/events', basicAuthentication, create(db.events));
    app.put('/api/events/:id', basicAuthentication, update(db.events));
    app.delete('/api/events/:id', basicAuthentication, destroy(db.events));

    //Events
    app.get('/api/demo/:id', basicAuthentication, get(db.demo));
    app.get('/api/demo', basicAuthentication, list(db.demo));
    app.get('/api/demo/:column/:value', basicAuthentication, find(db.demo));
    app.post('/api/demo', basicAuthentication, create(db.demo));
    app.put('/api/demo/:id', basicAuthentication, update(db.demo));
    app.delete('/api/demo/:id', basicAuthentication, destroy(db.demo));
*/
/*
    // List all files in a directory in Node.js recursively in a synchronous fashion
    let startDir = path.join(__dirname, './controllers');
    const walkSync = function(dir, filelist) {
        const files = fs.readdirSync(dir);
        filelist = filelist || [];
        files.forEach(function(file) {
            if (fs.statSync(dir + '/' + file).isDirectory()) {
                filelist = walkSync(dir + '/' + file, filelist);
            } else {
                console.log('using ', dir, file, __dirname, dir.replace(startDir, ''));
                console.log('using2', dir.replace(startDir, '') + '/' + file.replace('.controller.js', ''));
                console.log('./controllers' + dir.replace(startDir, '') + '/' + file.replace('.js', ''));
                app.use(
                    dir.replace(startDir, '') + '/' + file.replace('.controller.js', ''),
                    require('./controllers' + dir.replace(startDir, '') + '/' + file.replace('.js', '')),
                );
            }
        });
        return filelist;
    };
    console.log(walkSync(startDir));
    */

/*
const normalizedPath = path.join(__dirname, './controllers');
fs.readdirSync(normalizedPath).forEach(async file => {
    const controllername = file.replace('.controller.ts', '');
    const stats = fs.statSync(normalizedPath + '/' + file);
    if (stats.isFile()) {
        const controller = await import('./controllers/' + file);
        console.log(controller);
        app.use('/api/' + controllername, controller.default);
    }
    logging.info('Controller ' + file + ' wordt geladen --> ' + '/api/' + controllername);
});
*/

//User routes
import userController from './controllers/user.controller';
app.use('/api/users', userController);

//Events routes
import eventsController from './controllers/events.controller';
app.use('/api/events', eventsController);

//Meterstanden routes
import meterstandenController from './controllers/meterstanden.controller';
app.use('/api/meterstanden', meterstandenController);

//OAuth routes
import oauthController from './controllers/oauth.controller';
app.use('/api/oauth', oauthController);

//Meterstanden bijwerken en Enelogic routes
import enelogicController from './controllers/enelogic.controller';
app.use('/api/enelogic', enelogicController);

//Bunq routes
import bunqController from './controllers/bunq.controller';
app.use('/api/bunq', bunqController);

//SolarEdge
import solarEdgeController from './controllers/solaredge.controller';
app.use('/api/solaredge', solarEdgeController);

//Swagger
import swaggerController from './controllers/swagger.controller';
app.use('/api-docs', swaggerController);

import customController from './controllers/custom.controller';
app.use('/api/custom', customController);

//Tado
import tadoController from './controllers/tado.controller';
app.use('/api/tado', tadoController);

//DarkSky
//app.use('/api/darksky', require('./controllers/darksky.controller'));

//env=developer then make every model accessible
/*
TODO:
if (process.env.NODE_ENV === 'development') {
    app.get('/api/development/:model', async (req, res) => {
        let conditions = {};
        if (req.query.user) {
            conditions = { where: { userId: req.query.user } };
        }
        const data = await db[req.params.model].findAll(conditions);
        res.send(data);
    });
}
*/

//rest van de routes zijn van react
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'));
});
