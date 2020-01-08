var config = require('../config.json');
var winston = require('winston');


var format = winston.format.printf(function(opts) {
    return '' + opts.timestamp + ' ' + opts.level + ': ' + opts.message;
});

var logger = winston.createLogger({
    levels: {
        panic: 0,
        error: 1,
        warning: 2,
        info: 3,
        verbose: 4,
        debug: 5
    },
    transports: [
        new (winston.transports.Console)({
            format: winston.format.combine(
              winston.format.timestamp({
                  format: function () {
                      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
                      return (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
                  }
              }),
              format
            )
        })
    ],
    level: process.env.LOGLEVEL || config.logLevel
});

logger.log('info', 'loglevel ' + logger.level);

module.exports = logger.log.bind(logger);