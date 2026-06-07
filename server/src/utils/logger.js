const winston = require('winston');
const { NODE_ENV } = require('../../constant');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const transports = [
  // Console logs
  new winston.transports.Console(),
  // Error logs to file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // All logs to file
  new winston.transports.File({
    filename: 'logs/all.log',
  }),
];

const logger = winston.createLogger({
  level: NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
});

module.exports = logger;
