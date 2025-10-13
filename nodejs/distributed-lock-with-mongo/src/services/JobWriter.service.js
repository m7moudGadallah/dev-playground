const Job = require('../models/job.model');
const { randomUUID } = require('crypto');
const config = require('../utils/config.util');
const logger = require('../utils/logger.util');

class JobWriterService {
    constructor() {
        this.interval = setInterval(
            this.writeJob.bind(this),
            config.WRITE_JOBS_INTERVAL_MS
        );
    }

    async writeJob() {
        const jobId = randomUUID();
        try {
            const job = new Job({ jobId });
            await job.save();
            logger.info(`[${config.INSTANCE_ID}] Wrote job ${jobId}`);
        } catch (err) {
            logger.error(`[${config.INSTANCE_ID}] Failed to write job`, err);
        }
    }
}

module.exports = JobWriterService;