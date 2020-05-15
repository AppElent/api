import { Request, Response } from 'express';
import app from '../app';

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

import migrationController from './controllers/migrations.controller';
app.use('/api/migrations', migrationController);

import microsoftController from './controllers/microsoft.controller';
app.use('/api/microsoft', microsoftController);

import googleController from './controllers/google.controller';
app.use('/api/google', googleController);

//DarkSky
//app.use('/api/darksky', require('./controllers/darksky.controller'));

app.get('/', (req: Request, res: Response) => {
    res.redirect('/api-docs');
});
