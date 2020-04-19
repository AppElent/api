import winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');

/**
 * Create logger
 */
const format = winston.format;
const errorStackTracerFormat = winston.format(info => {
    if (info?.stack) {
        info.message = `${info.message} ${info.stack}`;
    }
    return info;
});
const customFormat = format.combine(
    format.label({ label: '[my-label]' }),
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.splat(),
    format.colorize(),
    errorStackTracerFormat(),
    format.printf(info => `[${info.timestamp}] - ${info.level}: ${info.message}`),
    format.errors({ stack: true }),
);

const customFormatFile = format.combine(
    format.label({ label: '[my-label]' }),
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.splat(),
    errorStackTracerFormat(),
    format.printf(info => `[${info.timestamp}] - ${info.level}: ${info.message}`),
    format.errors({ stack: true }),
);

export const logging = winston.createLogger({
    level: 'info',
    format: customFormatFile,
    //defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new DailyRotateFile({
            datePattern: 'YYYY-MM-DD',
            filename: './logs/%DATE%_strderr.log',
            level: 'error',
            maxFiles: '14d',
            maxSize: '20m',
            format: customFormatFile,
            zippedArchive: true,
        }),
        new DailyRotateFile({
            datePattern: 'YYYY-MM-DD',
            filename: './logs/%DATE%_stdout.log',
            maxFiles: '14d',
            maxSize: '20m',
            format: customFormatFile,
            zippedArchive: true,
        }),
        new winston.transports.Console({
            format: customFormat,
        }),
    ],
});

export class LoggerStream {
    write(message: string): void {
        logging.info(message.substring(0, message.lastIndexOf('\n')));
    }
}
