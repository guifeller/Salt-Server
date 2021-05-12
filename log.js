//Salt's logging system

const fs = require('fs');

const infoStream = fs.createWriteStream("logs/info.txt");
const errorStream = fs.createWriteStream("logs/error.txt");

exports.logInfo = (data) => {
    let log = new Date().toISOString() + " : " + data + "\n";
    infoStream.write(log);
};

exports.logError = (data) => {
    let log = new Date().toISOString() + " : " + data + "\n";
    errorStream.write(log);

};

