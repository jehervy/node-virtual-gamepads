var config = require('../config.json');
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({timestamp: function() {
            var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
            return (new Date(Date.now() - tzoffset)).toISOString().slice(0,-1);
        }})
    ],
    level: process.env.LOGLEVEL || config.logLevel
});
logger.log('debug', 'loglevel',  logger.level);

module.exports = logger.log.bind(logger);