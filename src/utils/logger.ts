import winston, { Logger } from 'winston';
import { ElasticsearchTransport, LogData, Transformer } from 'winston-elasticsearch';

// Define your own transformer function
const esTransformer: Transformer = (logData: LogData) => {
  return {
    '@timestamp': new Date().toISOString(),
    message: logData.message,
    level: logData.level,
    // Include any other metadata you want to log
    meta: logData.meta || {}
  };
};

export const winstonLogger = (elasticsearchNode: string, name: string, level: string): Logger => {
  const options = {
    console: {
      level,
      handleExceptions: true,
      json: false,
      colorize: true
    },
    elasticsearch: {
      level,
      transformer: esTransformer,
      // Add apm if required by your version of winston-elasticsearch
      apm: undefined,
      clientOpts: {
        node: elasticsearchNode,
        log: level,
        maxRetries: 2,
        requestTimeout: 10000,
        sniffOnStart: false
      }
    }
  };

  const esTransport = new ElasticsearchTransport(options.elasticsearch);

  const logger = winston.createLogger({
    exitOnError: false,
    defaultMeta: { service: name },
    transports: [
      new winston.transports.Console(options.console),
      esTransport
    ]
  });

  return logger;
};
