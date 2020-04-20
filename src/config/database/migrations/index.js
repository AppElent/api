const asyncFunction = async () => {
    return 'ok';
};

const up = queryInterface => {
    return asyncFunction();
};

const down = queryInterface => {
    return asyncFunction();
};

const sync = async Sequelize => {
    return Sequelize.sync({ force: true });
};

module.exports = {
    down,
    sync,
    up,
};
