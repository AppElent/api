const fs = require('fs'); //eslint-disable-line
const forge = require('node-forge'); //eslint-disable-line

const getEnv = argv => {
    let found = false;
    for (const arg of argv) {
        //console.log(arg);
        if (found) {
            return arg;
        }
        if (arg.toLowerCase() === '--env') {
            found = true;
        }
    }
    return 'development';
};

const asyncFunction = async () => {
    return 'ok';
};

const up = queryInterface => {
    return asyncFunction();
};

const down = queryInterface => {
    return asyncFunction();
};

const sync = Sequelize => {
    return Sequelize.sync({ force: true });
};

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

const encryptString = (string, encryptionKey) => {
    // create a random initialization vector
    const iv = forge.random.getBytesSync(32);
    // turn hex-encoded key into bytes
    const encryptionKeyBytes = forge.util.hexToBytes(encryptionKey);
    // create a new aes-cbc cipher with our key
    const cipher = forge.cipher.createCipher('AES-CBC', encryptionKeyBytes);
    // turn our string into a buffer
    const buffer = forge.util.createBuffer(string, 'utf8');

    cipher.start({ iv: iv });
    cipher.update(buffer);
    cipher.finish();

    return {
        iv: forge.util.bytesToHex(iv),
        key: encryptionKey,
        encryptedString: cipher.output.toHex(),
    };
};

/**
 * Decrypts a string using the key and iv
 * @param encryptedString
 * @param key Encryption key
 * @param iv IV returned from the encrypt function
 * @returns {string}
 */
const decryptString = (encryptedString, key, iv) => {
    // get byte data from hex encoded strings
    const encrypedBytes = forge.util.hexToBytes(encryptedString);
    // create a new forge buffer using the bytes
    const encryptedBuffer = forge.util.createBuffer(encrypedBytes, 'raw');
    const keyBytes = forge.util.hexToBytes(key);
    const ivBytes = forge.util.hexToBytes(iv);

    // create a new decipher with our key and iv
    const decipher = forge.cipher.createDecipher('AES-CBC', keyBytes);
    decipher.start({ iv: ivBytes });
    decipher.update(encryptedBuffer);

    // check the decipher results
    const result = decipher.finish();
    if (!result) {
        throw new Error('Failed to decrypt string, the encryption string might have changed');
    }
    // get the raw bytes from the forge buffer
    const outputBytes = decipher.output.getBytes();

    // turn forge bytes into a regular buffer
    const nodeBuffer = Buffer.from(outputBytes, 'binary');

    // return the result as an utf8-encoded string
    return nodeBuffer.toString('utf8');
};

const getEncryptionString = (val, key) => {
    const encrypted = encryptString(val, key);
    return encrypted.iv + '~' + encrypted.encryptedString;
};

const getEncryptionValue = (val, key) => {
    return !val ? null : decryptString(val.split('~')[1], key, val.split('~')[0]);
};

const generateRandomKey = keySize => {
    // random bytes
    const key = forge.random.getBytesSync(keySize);

    // straight to hex and return it
    return forge.util.bytesToHex(key);
};

module.exports = {
    down,
    generateRandomKey,
    getEncryptionString,
    getEncryptionValue,
    getEnv,
    getJSON,
    getRandomDate,
    getRandomInt,
    getRandomString,
    oneOf,
    runSeeder,
    runSeederFromObject,
    sync,
    up,
};
