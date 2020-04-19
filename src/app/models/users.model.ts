import { Model, DataTypes } from 'sequelize';

import Sequelize from './index';

export default class User extends Model {
    public uid: string;
    public name: string;
    public email: string;
    public lastlogon: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        uid: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        lastlogon: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: 'users',
        sequelize: Sequelize,
    },
);
