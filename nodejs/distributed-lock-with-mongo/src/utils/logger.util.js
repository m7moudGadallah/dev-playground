const { format } = require('util');
const { inspect } = require('util');

class LoggerUtil {
    info(message, ...args) {
        console.log(format(`[${new Date().toISOString()}] [INFO]`, message, ...args));
    }

    warn(message, ...args) {
        console.log(format(`[${new Date().toISOString()}] [WARN]`, message, ...args));
    }

    error(message, ...args) {
        const processedArgs = args.map(arg =>
            arg instanceof Error ? inspect(arg, { depth: null }) : arg
        );
        console.error(format(`[${new Date().toISOString()}] [ERROR]`, message, ...processedArgs));
    }

    debug(message, ...args) {
        if (process.env.DEBUG === 'true') {
            console.debug(format(`[${new Date().toISOString()}] [DEBUG]`, message, ...args));
        }
    }
}

module.exports = new LoggerUtil();