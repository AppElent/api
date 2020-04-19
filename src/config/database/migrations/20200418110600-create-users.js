'use strict';

const { Sequelize } = require('sequelize'); // eslint-disable-line

module.exports = {
    up: queryInterface => {
        return queryInterface.createTable('users', {
            uid: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
            },
            email: {
                type: Sequelize.STRING,
            },
            lastlogon: {
                type: Sequelize.DATE,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    down: queryInterface => {
        return queryInterface.dropTable('users');
    },
};
