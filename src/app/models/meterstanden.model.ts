import moment from 'moment';
import { Model, DataTypes } from 'sequelize';

import Sequelize from './index';

export const swaggerModel = {
    type: 'object',
    properties: {
        datetime: {
            type: 'string',
        },
        180: {
            type: 'number',
        },
        181: {
            type: 'number',
        },
        182: {
            type: 'number',
        },
        280: {
            type: 'number',
        },
        281: {
            type: 'number',
        },
        282: {
            type: 'number',
        },
    },
};

export default class Meterstand extends Model {
    public datetime: Date;
    public userId: string;
    public value: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Meterstand.init(
    {
        datetime: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            get(this: Meterstand): Date {
                return moment(this.getDataValue('datetime'))
                    .tz('Europe/Amsterdam')
                    .toDate();
            },
            unique: 'compositeIndex',
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'compositeIndex',
        },
        180: {
            type: DataTypes.INTEGER,
        },
        181: {
            type: DataTypes.INTEGER,
        },
        182: {
            type: DataTypes.INTEGER,
        },
        280: {
            type: DataTypes.INTEGER,
        },
        281: {
            type: DataTypes.INTEGER,
        },
        282: {
            type: DataTypes.INTEGER,
        },
    },
    {
        tableName: 'meterstanden',
        sequelize: Sequelize,
        defaultScope: {
            attributes: { exclude: ['userId'] },
        },
    },
);
