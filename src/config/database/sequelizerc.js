const path = require('path'); // eslint-disable-line

module.exports = {
    config: path.resolve('./src/config/database', 'index.js'),
    'migrations-path': path.resolve('./src/config/database', 'migrations'),
    'models-path': path.resolve('./src/app', 'models'),
    'seeders-path': path.resolve('./src/config/database', 'seeders'),
};
