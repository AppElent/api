'use strict';

const { Sequelize } = require('sequelize'); // eslint-disable-line

module.exports = {
    up: queryInterface => {
        return queryInterface.addColumn('events', 'severity', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
    },

    down: queryInterface => {
        return queryInterface.removeColumn('events', 'severity').catch(error => {
            console.log(error);
        });
    },
};
