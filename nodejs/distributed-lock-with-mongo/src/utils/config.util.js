const os = require('os');
const hostname = os.hostname();

module.exports = {
    // Application
    PORT: parseInt(process.env.PORT),
    INSTANCE_ID: hostname,
    NODE_ENV: process.env.NODE_ENV,

    // MongoDB
    MONGODB_URI: process.env.MONGODB_URI,

    // Lock Configuration
    LOCK_KEY: process.env.LOCK_KEY,
    LOCK_TTL_MS: parseInt(process.env.LOCK_TTL_MS),

    // Job Configuration
    WRITE_JOBS_INTERVAL_MS: parseInt(process.env.WRITE_JOBS_INTERVAL_MS),
    PROCESS_JOBS_INTERVAL_MS: parseInt(process.env.PROCESS_JOBS_INTERVAL_MS),
    PROCESS_BATCH_SIZE: parseInt(process.env.PROCESS_BATCH_SIZE),
    JOB_PROCESSING_TIME_MIN: parseInt(process.env.JOB_PROCESSING_TIME_MIN),
    JOB_PROCESSING_TIME_MAX: parseInt(process.env.JOB_PROCESSING_TIME_MAX)
};