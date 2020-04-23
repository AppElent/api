'use strict';

const { Sequelize } = require('sequelize'); // eslint-disable-line

module.exports = {
    up: queryInterface => {
        return queryInterface.changeColumn('oauthproviders', 'credentials', {
            type: Sequelize.STRING(1000),
            allowNull: false,
            set(val) {
                this.setDataValue('credentials', encryption.getEncryptionString(val, encryptionKey));
            },
            get() {
                return encryption.getEncryptionValue(this.getDataValue('credentials'), encryptionKey);
            },
        });
    },

    down: queryInterface => {
        return queryInterface.changeColumn('oauthproviders', 'credentials', {
            type: Sequelize.STRING,
            allowNull: false,
        });
    },
};
