import moment from 'moment';
import { Model, DataTypes } from 'sequelize';

import Sequelize from './index';

export const swaggerModel = {
    type: 'object',
    properties: {
        datetime: {
            type: 'string',
        },
        application: {
            type: 'string',
        },
        category: {
            type: 'string',
        },
        severity: {
            type: 'number',
        },
        value: {
            type: 'string',
        },
    },
};

export default class Event extends Model {
    public datetime: Date;
    public userId: string;
    public application: string;
    public category: string;
    public severity: number;
    public value: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Event.init(
    {
        datetime: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            get(this: Event): Date {
                return moment(this.getDataValue('datetime'))
                    .tz('Europe/Amsterdam')
                    .toDate();
            },
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        application: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        severity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: 'events',
        sequelize: Sequelize,
        defaultScope: {
            attributes: { exclude: ['userId'] },
        },
    },
);
