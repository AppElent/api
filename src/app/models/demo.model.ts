import moment from 'moment';
import { Model, DataTypes } from 'sequelize';

import Sequelize from './index';

export const swaggerModel = {
    type: 'object',
    properties: {
        datetime: {
            type: 'string',
        },
        value: {
            type: 'string',
        },
    },
};

export default class Demo extends Model {
    public datetime: Date;
    public userId: string;
    public value: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Demo.init(
    {
        datetime: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            get(this: Demo): Date {
                return moment(this.getDataValue('datetime'))
                    .tz('Europe/Amsterdam')
                    .toDate();
            },
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: 'demo',
        sequelize: Sequelize,
        defaultScope: {
            attributes: { exclude: ['userId'] },
        },
    },
);
