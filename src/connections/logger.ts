const winston = require('winston');
// const DatadogTransport = require('winston-datadog');
const DatadogTransport = require('@shelf/winston-datadog-logs-transport');

const logger = ((service='undefined-service', config) => {
    const _l = winston.createLogger({
        level: 'debug',
        format: winston.format.json(),
        defaultMeta: { service },
        transports: [
            new winston.transports.Console({
                format: winston.format.simple(),
                colorize: true
            })
        ]
    });


    if (config.datadog && config.datadog.apiKey){
        _l.add(
            new DatadogTransport({
                apiKey: config.datadog.apiKey,
                metadata: {
                    ddsource: service,
                    environment: config.environment
                }
            })
        );
    }


    // To make compatible with fastify logger
    // _l.log = () => {_l.info(arguments[0])};
    _l.fatal = () => {_l.error(arguments[0])};
    _l.trace = () => {_l.silly(arguments[0])};

    return _l;
});

module.exports = logger;
