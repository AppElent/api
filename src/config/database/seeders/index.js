const fs = require('fs'); //eslint-disable-line

const getJSON = filename => {
    const content = fs.readFileSync(__dirname + '/' + filename);
    const result = JSON.parse(content);
    return result;
};

const getRandomDate = (date1, date2) => () => {
    function randomValueBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
    date1 = date1 || '01-01-1970';
    date2 = date2 || new Date().toLocaleDateString();
    date1 = new Date(date1).getTime();
    date2 = new Date(date2).getTime();
    if (date1 > date2) {
        return new Date(randomValueBetween(date2, date1));
    } else {
        return new Date(randomValueBetween(date1, date2));
    }
};

const getRandomInt = (min, max) => () => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const getRandomString = length => () => {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
};

const oneOf = array => () => {
    return array[Math.floor(Math.random() * array.length)];
};

const changeData = async (data, options, previousData) => {
    for (const column of Object.keys(options)) {
        const columnValue = options[column];
        if (options[column] === undefined) {
            //do nothing
        } else if (typeof columnValue === 'function') {
            data[column] = await columnValue(previousData);
        } else {
            data[column] = columnValue;
        }
    }
    return data;
};

const runSeederFromObject = async (data, options) => {
    for (const row of data) {
        row = changeData(row, options);
    }
    return data;
};

const runSeeder = async (number, options) => {
    const data = [];
    let previous;
    for (let step = 1; step <= number; step++) {
        const newEntry = await changeData({}, options, previous);
        data.push(newEntry);
        previous = newEntry;
    }
    return data;
};

module.exports = {
    getJSON,
    getRandomDate,
    getRandomInt,
    getRandomString,
    oneOf,
    runSeeder,
    runSeederFromObject,
};
