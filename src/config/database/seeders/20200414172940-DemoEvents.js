'use strict';

const { getRandomDate, getRandomInt, getRandomString, oneOf, runSeeder } = require('./index'); // eslint-disable-line

const options = {
    datetime: getRandomDate('2019-01-01'),
    severity: getRandomInt(1, 5),
    category: oneOf(['Error', 'Warning', 'Info']),
    userId: oneOf(['fkkdEvpjgkhlhtQGqdkHTToWO233', 'p1ezZHQBsyWQDYm9BrCm2wlpP1o1']),
    application: oneOf(['Administratie App', 'Administratie App Dev', 'Domoticz']),
    value: getRandomString(25),
    createdAt: new Date(),
    updatedAt: new Date(),
};

module.exports = {
    up: queryInterface => {
        return runSeeder(100, options).then(result => queryInterface.bulkInsert('events', result));
    },

    down: queryInterface => {
        return queryInterface.bulkDelete('events', null, {});
    },
};
