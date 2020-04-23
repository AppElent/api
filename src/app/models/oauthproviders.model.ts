import { Model, DataTypes } from 'sequelize';

import Sequelize from './index';
import Encryption from '../modules/Encryption';

const encryptionKey = process.env.SEQUELIZE_ENCRYPTION_KEY;
const encryption = new Encryption();

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
            type: DataTypes.STRING(1000),
            allowNull: false,
            set(this: OauthProvider, val: string): void {
                this.setDataValue('credentials', encryption.getEncryptionString(val, encryptionKey));
            },
            get(this: OauthProvider): string {
                return encryption.getEncryptionValue(this.getDataValue('credentials'), encryptionKey);
            },
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
