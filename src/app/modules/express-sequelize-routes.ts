type Options = {
    idColumnName?: string;
    userColumnName?: string;
    cache?: any;
    reqUserProperty?: string;
    verbose?: boolean;
};

export default class SequelizeRoutes {
    private globalOptions: Options;

    constructor(options: Options) {
        this.globalOptions = options;
    }

    public setOptions(options: Options): void {
        this.globalOptions = options;
    }

    private checkOptions = (options: Options): Options => {
        options = { ...this.globalOptions, ...options };
        if (options.userColumnName && !options.reqUserProperty) {
            throw 'You have to specify both userColumnName and reqUserProperty';
        }
        if (options.verbose === true) {
            console.log('Options for sequelize: ', options);
        }
        return options;
    };

    public get = (model: any, options?: Options): any => async (req: any, res: any): Promise<any> => {
        try {
            //If no UID property on request object then return with forbidden error
            //if (req.uid === undefined) return res.status(401).send({ success: false, message: 'No token given' });
            options = this.checkOptions(options);
            //const entry = await model.findByPk(req.params[options.idColumnName]);
            const conditions = { where: { [options.idColumnName]: req.params[options.idColumnName] } };
            if (options.userColumnName && options.idColumnName !== options.userColumnName) {
                conditions.where[options.userColumnName] = req[options.reqUserProperty];
            }
            const entry = await model.findOne(conditions);
            if (entry) {
                return res.send({ success: true, data: entry });
            }
            return res.status(404).send({ success: false, message: 'No record found' });
        } catch (err) {
            return res.status(500).send({ success: false, message: err });
        }
    };

    public list = (model: any, options: Options = { idColumnName: 'id' }) => async (
        req: any,
        res: any,
    ): Promise<any> => {
        try {
            //If no UID property on request object then return with forbidden error
            //if (req.uid === undefined) return res.status(401).send({ success: false, message: 'No token given' });
            options = this.checkOptions(options);
            const conditions = options.userColumnName
                ? { where: { [options.userColumnName]: req[options.reqUserProperty] } }
                : {};
            let entries = [];
            if (options.cache !== undefined) {
                entries = await options.cache.get(req.uid + '_all', async () => {
                    return await model.findAll(conditions);
                });
            } else {
                entries = await model.findAll(conditions);
            }
            return res.send({ success: true, data: entries });
        } catch (err) {
            return res.status(500).send({ success: false, message: err });
        }
    };

    public find = (model: any, options: Options = { idColumnName: 'id' }) => async (
        req: any,
        res: any,
    ): Promise<any> => {
        try {
            //If no UID property on request object then return with forbidden error
            //if (req.uid === undefined) return res.status(401).send({ success: false, message: 'No token given' });
            options = this.checkOptions(options);
            const conditions: any = { where: { [req.params.column]: req.params.value } };
            if (options.userColumnName !== null) {
                conditions.where[options.userColumnName] = req[options.reqUserProperty];
            }
            const entry = await model.findOne(conditions);
            if (!entry) return res.status(404).send({ success: false, message: 'Niets gevonden' });
            return res.send({ success: true, data: entry });
        } catch (err) {
            return res.status(500).send({ success: false, message: err });
        }
    };

    public create = (model: any, options: Options = { idColumnName: 'id' }) => async (
        req: any,
        res: any,
    ): Promise<any> => {
        try {
            //If no UID property on request object then return with forbidden error
            //if (req.uid === undefined) return res.status(401).send({ success: false, message: 'No token given' });
            options = this.checkOptions(options);
            const body = req.body;
            if (Array.isArray(body)) {
                body.forEach(row => {
                    row[options.userColumnName] = req[options.reqUserProperty];
                });
            }
            if (options.userColumnName) {
                if (Array.isArray(body)) {
                    body.forEach(row => {
                        row[options.userColumnName] = req[options.reqUserProperty];
                    });
                    const result = await model.bulkCreate(body, { ignoreDuplicates: true });
                    return res.send({ success: true, data: result });
                }
                body[options.userColumnName] = req[options.reqUserProperty];
            }
            const entry = await model.create(body);
            return res.send({ success: true, data: entry });
        } catch (err) {
            return res.status(500).send({ success: false, message: err });
        }
    };

    public update = (model: any, options: Options = { idColumnName: 'id' }) => async (
        req: any,
        res: any,
    ): Promise<any> => {
        try {
            //If no UID property on request object then return with forbidden error
            //if (req.uid === undefined) return res.status(401).send({ success: false, message: 'No token given' });
            options = this.checkOptions(options);
            const body = req.body;
            if (options.userColumnName) {
                body[options.userColumnName] = req[options.reqUserProperty];
            }
            const entry = await model.update(body, {
                where: { [options.idColumnName]: req.params[options.idColumnName] },
            });
            return res.send({ success: true, data: entry });
        } catch (err) {
            return res.status(500).send({ success: false, message: err });
        }
    };

    public createOrUpdate = (model: any, options: Options = { idColumnName: 'id' }) => async (
        req: any,
        res: any,
    ): Promise<any> => {
        try {
            //If no UID property on request object then return with forbidden error
            //if (req.uid === undefined) return res.status(401).send({ success: false, message: 'No token given' });
            options = this.checkOptions(options);
            const conditions = req.body.conditions;
            const body = req.body.body;
            if (options.userColumnName) {
                conditions[options.userColumnName] = req[options.reqUserProperty];
                body[options.userColumnName] = req[options.reqUserProperty];
            }
            conditions[options.userColumnName] = req.uid;
            body[options.userColumnName] = req.uid;
            let entry = await model.findOne(conditions);
            if (entry) {
                entry = await entry.update(body);
            } else {
                entry = await model.create(body);
            }
            return res.send({ success: true, data: entry });
        } catch (err) {
            return res.status(500).send({ success: false, message: err });
        }
    };

    public destroy = (model: any, options: Options = { idColumnName: 'id' }) => async (
        req: any,
        res: any,
    ): Promise<any> => {
        //If no UID property on request object then return with forbidden error
        //if (req.uid === undefined) return res.status(401).send({ success: false, message: 'No token given' });
        options = this.checkOptions(options);
        const conditions: any = { where: { [options.idColumnName]: req.params[options.idColumnName] } };
        if (options.userColumnName) {
            conditions.where[options.userColumnName] = req[options.reqUserProperty];
        }
        try {
            await model.destroy(conditions);
            return res.send({ success: true, message: 'Deleted successfully' });
        } catch (err) {
            console.log(err);
            return res.status(500).send({ success: false, message: err });
        }
    };
}

// /*
// const checkOptions = (options: Options): Options => {
//     if (options.userColumnName && !options.reqUserProperty) {
//         throw 'You have to specify both userColumnName and reqUserProperty';
//     }
//     if (options.verbose === true) {
//         console.log('Options for sequelize: ', options);
//     }
//     if (!options.idColumnName) {
//         options.idColumnName = 'id';
//     }
//     return options;
// };

// /**
//  * Get entry by ID
//  * @param model
//  * @param options {Options}
//  */
// export const get = (model: any, options: Options = { idColumnName: 'id' }): any => async (
//     req: any,
//     res: any,
// ): Promise<any> => {
//     try {
//         //If no UID property on request object then return with forbidden error
//         //if (req.uid === undefined) return res.status(401).send({ success: false, message: 'No token given' });
//         options = checkOptions(options);
//         const conditions = options.userColumnName
//             ? { where: { [req.params[options.userColumnName]]: req[options.reqUserProperty] } }
//             : {};

//         const entry = await model.findByPk(req.params[options.idColumnName], conditions);
//         if (!entry) return res.status(404).send({ success: false, message: 'No records found' });
//         return res.send({ success: true, data: entry });
//     } catch (err) {
//         return res.status(500).send({ success: false, message: err });
//     }
// };

// /**
//  * Find single entry by column name
//  * @param model
//  * @param options {Options}
//  */
// export const find = (model: any, options: Options = { idColumnName: 'id' }) => async (
//     req: any,
//     res: any,
// ): Promise<any> => {
//     try {
//         //If no UID property on request object then return with forbidden error
//         //if (req.uid === undefined) return res.status(401).send({ success: false, message: 'No token given' });
//         options = checkOptions(options);
//         const conditions: any = { where: { [req.params.column]: req.params.value } };
//         if (options.userColumnName !== null) {
//             conditions.where[options.userColumnName] = req[options.reqUserProperty];
//         }
//         const entry = await model.findOne(conditions);
//         if (!entry) return res.status(404).send({ success: false, message: 'Niets gevonden' });
//         return res.send({ success: true, data: entry });
//     } catch (err) {
//         return res.status(500).send({ success: false, message: err });
//     }
// };

// /**
//  * List all entries
//  * @param model sequelize model
//  * @param options {Options} options object
//  */
// export const list = (model: any, options: Options = { idColumnName: 'id' }) => async (
//     req: any,
//     res: any,
// ): Promise<any> => {
//     try {
//         //If no UID property on request object then return with forbidden error
//         //if (req.uid === undefined) return res.status(401).send({ success: false, message: 'No token given' });
//         options = checkOptions(options);
//         const conditions = options.userColumnName
//             ? { where: { [options.userColumnName]: req[options.reqUserProperty] } }
//             : {};
//         let entries = [];
//         if (options.cache !== undefined) {
//             entries = await options.cache.get(req.uid + '_all', async () => {
//                 return await model.findAll(conditions);
//             });
//         } else {
//             entries = await model.findAll(conditions);
//         }
//         return res.send({ success: true, data: entries });
//     } catch (err) {
//         return res.status(500).send({ success: false, message: err });
//     }
// };

// /**
//  * Create entry
//  * @param model
//  * @param options {Options}
//  */
// export const create = (model: any, options: Options = { idColumnName: 'id' }) => async (
//     req: any,
//     res: any,
// ): Promise<any> => {
//     console.log(0);
//     try {
//         //If no UID property on request object then return with forbidden error
//         //if (req.uid === undefined) return res.status(401).send({ success: false, message: 'No token given' });
//         console.log(999, 'test');
//         options = checkOptions(options);
//         console.log(2);
//         const body = req.body;
//         if (options.userColumnName) {
//             body[options.userColumnName] = req[options.reqUserProperty];
//         }
//         console.log(body, model);
//         const entry = await model.create(body);

//         return res.send({ success: true, data: entry });
//     } catch (err) {
//         return res.status(500).send({ success: false, message: err });
//     }
// };

// /**
//  * Update entry
//  * @param model
//  * @param options {Options}
//  */
// export const update = (model: any, options: Options = { idColumnName: 'id' }) => async (
//     req: any,
//     res: any,
// ): Promise<any> => {
//     try {
//         //If no UID property on request object then return with forbidden error
//         //if (req.uid === undefined) return res.status(401).send({ success: false, message: 'No token given' });

//         options = checkOptions(options);
//         const body = req.body;

//         if (options.userColumnName) {
//             body[options.userColumnName] = req[options.reqUserProperty];
//         }
//         const entry = await model.update(body, { where: { [options.idColumnName]: req.params[options.idColumnName] } });

//         return res.send({ success: true, data: entry });
//     } catch (err) {
//         return res.status(500).send({ success: false, message: err });
//     }
// };

// /**
//  * Create or update entry
//  * @param model
//  * @param options {Options}
//  */
// export const createOrUpdate = (model: any, options: Options = { idColumnName: 'id' }) => async (
//     req: any,
//     res: any,
// ): Promise<any> => {
//     try {
//         //If no UID property on request object then return with forbidden error
//         //if (req.uid === undefined) return res.status(401).send({ success: false, message: 'No token given' });

//         options = checkOptions(options);
//         const conditions = req.body.conditions;
//         const body = req.body.body;
//         if (options.userColumnName) {
//             conditions[options.userColumnName] = req[options.reqUserProperty];
//             body[options.userColumnName] = req[options.reqUserProperty];
//         }
//         conditions[options.userColumnName] = req.uid;
//         body[options.userColumnName] = req.uid;
//         let entry = await model.findOne(conditions);
//         if (entry) {
//             entry = await entry.update(body);
//         } else {
//             entry = await model.create(body);
//         }
//         return res.send({ success: true, data: entry });
//     } catch (err) {
//         return res.status(500).send({ success: false, message: err });
//     }
// };

// /**
//  * Delete entry
//  * @param model
//  * @param options {Options}
//  */
// export const destroy = (model: any, options: Options = { idColumnName: 'id' }) => async (
//     req: any,
//     res: any,
// ): Promise<any> => {
//     //If no UID property on request object then return with forbidden error
//     //if (req.uid === undefined) return res.status(401).send({ success: false, message: 'No token given' });
//     options = checkOptions(options);
//     const conditions: any = { where: { [options.idColumnName]: req.params[options.idColumnName] } };
//     if (options.userColumnName) {
//         conditions.where[options.userColumnName] = req[options.reqUserProperty];
//     }

//     try {
//         await model.destroy(conditions);
//         return res.send({ success: true, message: 'Deleted successfully' });
//     } catch (err) {
//         console.log(err);
//         return res.status(500).send({ success: false, message: err });
//     }
// };
// */
