import express, { Request, Response } from 'express';
const router = express.Router();

import { basicAuthentication } from '../middleware/authentication';
import { asyncHandler } from '../modules/express-collection';
import Sequelize, { migrator, seeder } from '../models';
import { logging } from '../modules/Logging';

const pending = async (req: Request, res: Response): Promise<Response> => {
    const pendingMigrations = await migrator.pending();
    return res.send({ success: true, data: pendingMigrations });
};

const migrateUp = async (req: Request, res: Response): Promise<Response> => {
    const pendingMigrations = await migrator.pending();
    if (pendingMigrations.length > 0) {
        logging.info('There are ' + pendingMigrations.length + ' migrations pending');
        console.log(pendingMigrations);
        const migration = await migrator.up();
        return res.send({ success: true, data: migration });
    }
    return res.send({ success: true, data: 'No migration pending' });
};

const migrateDown = async (req: Request, res: Response): Promise<Response> => {
    const result = migrator.down(req.params.name);
    return res.send({ success: true, data: result });
};

const seedUp = async (req: Request, res: Response): Promise<Response> => {
    Sequelize.options.logging = false;
    const pendingSeeders = await seeder.pending();
    if (pendingSeeders.length > 0) {
        logging.info('Seeding: ' + pendingSeeders.length + ' seeders will be executed.');
        const seed = await seeder.up();
        return res.send({ success: true, data: seed });
    }
    Sequelize.options.logging = logging.info.bind(logging);
    return res.send({ success: true, data: 'No seeder present' });
};

const seedDown = async (req: Request, res: Response): Promise<Response> => {
    Sequelize.options.logging = false;
    const revert = await seeder.down({ to: 0 });
    Sequelize.options.logging = logging.info.bind(logging);
    return res.send({ success: true, data: revert });
};

const sync = async (req: Request, res: Response): Promise<Response> => {
    Sequelize.options.logging = false;
    const sync = await Sequelize.sync({ force: true });
    Sequelize.options.logging = logging.info.bind(logging);
    return res.send({ success: true, data: sync });
};

router.use(basicAuthentication);
router.post('/migrate/up', asyncHandler(migrateUp));
router.post('/migrate/down/:name', asyncHandler(migrateDown));
router.get('/pending', asyncHandler(pending));
router.post('/seed/up', asyncHandler(seedUp));
router.post('/seed/down', asyncHandler(seedDown));
router.post('/sync', asyncHandler(sync));
export default router;
