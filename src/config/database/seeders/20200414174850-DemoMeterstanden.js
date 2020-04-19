'use strict';

const { getRandomInt, getRandomString, oneOf, runSeeder } = require('./index'); // eslint-disable-line
const moment = require('moment'); // eslint-disable-line

const date = moment().startOf('hour');
date.add(-(500 * 5), 'minutes');

const incrementDate = initial => previous => {
    let momentdatetime;
    if (previous) {
        momentdatetime = moment(previous.datetime);
        momentdatetime.add(5, 'minutes');
    } else {
        momentdatetime = initial;
    }
    return momentdatetime.toDate();
};

const incrementMeterstand = (initial, column) => previous => {
    if (previous) {
        const previousMeterstand = previous[column];
        return previousMeterstand + getRandomInt(20, 100)();
    } else {
        return initial;
    }
};

const options = {
    datetime: incrementDate(date),
    userId: oneOf(['fkkdEvpjgkhlhtQGqdkHTToWO233']),
    180: incrementMeterstand(0, 180),
    181: incrementMeterstand(0, '181'),
    182: incrementMeterstand(0, '182'),
    280: incrementMeterstand(0, '280'),
    281: incrementMeterstand(0, '281'),
    282: incrementMeterstand(0, '282'),
    createdAt: new Date(),
    updatedAt: new Date(),
};

module.exports = {
    up: async queryInterface => {
        return runSeeder(500, options).then(result => queryInterface.bulkInsert('meterstanden', result));
    },

    down: queryInterface => {
        return queryInterface.bulkDelete('meterstanden', null, {});
    },
};
