import { Model, DataTypes } from 'sequelize';

import Sequelize from './index';

export default class OauthProvider extends Model {
    public id: string;
    public credentials: string;
    public defaultScope: string;
    public redirectUrl: string;
    public flow: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

OauthProvider.init(
    {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        credentials: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        defaultScope: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        redirectUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        flow: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: 'oauthproviders',
        sequelize: Sequelize,
    },
);
