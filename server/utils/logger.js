import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const customFormat = printf(({ level, message, timestamp, reqId }) => {
  const trace = reqId ? `[Trace: ${reqId}] ` : '';
  return `${timestamp} ${level}: ${trace}${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    colorize(),
    timestamp(),
    customFormat
  ),
  transports: [
    new winston.transports.Console()
    // For scaling: new winston.transports.File({ filename: 'combined.log' })
  ]
});

export default logger;
