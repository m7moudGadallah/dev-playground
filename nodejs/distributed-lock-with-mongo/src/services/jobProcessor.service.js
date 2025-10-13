const { MongoDistributedLock } = require('./mongoDistributedLock.service');
const DistributedLockModel = require('../models/distributedLock.model');
const Job = require('../models/job.model');
const config = require('../utils/config.util');
const logger = require('../utils/logger.util');

class JobProcessor {
    constructor() {
        this.lock = new MongoDistributedLock(
            DistributedLockModel,
            {
                lockKey: config.LOCK_KEY,
                ttl: config.LOCK_TTL_MS,
                instanceId: config.INSTANCE_ID
            }
        );

        this.interval = setInterval(
            this.processJobsWithLock.bind(this),
            config.PROCESS_JOBS_INTERVAL_MS
        );

        this.lockExtensionInterval = null;
    }

    async processJobsWithLock() {
        try {
            // Try to acquire the lock
            const acquired = await this.lock.acquire();

            if (acquired) {
                logger.info(`[${config.INSTANCE_ID}] Acquired lock, processing jobs...`);

                // Start lock extension heartbeat
                this.startLockExtension();

                try {
                    await this.processJobs();
                } finally {
                    // Stop extension and release lock when done
                    this.stopLockExtension();
                    await this.lock.release();
                    logger.info(`[${config.INSTANCE_ID}] Released lock`);
                }
            } else {
                logger.debug(`[${config.INSTANCE_ID}] Could not acquire lock`);
            }
        } catch (err) {
            logger.error(`[${config.INSTANCE_ID}] Error processing jobs:`, err);
            this.stopLockExtension();
        }
    }

    startLockExtension() {
        // Extend lock every TTL/2 milliseconds
        const extensionInterval = Math.floor(config.LOCK_TTL_MS / 2);
        this.lockExtensionInterval = setInterval(async () => {
            try {
                const extended = await this.lock.extend();
                if (extended) {
                    logger.debug(`[${config.INSTANCE_ID}] Extended lock`);
                } else {
                    logger.error(`[${config.INSTANCE_ID}] Failed to extend lock`);
                    this.stopLockExtension();
                }
            } catch (err) {
                logger.error(`[${config.INSTANCE_ID}] Error extending lock:`, err);
                this.stopLockExtension();
            }
        }, extensionInterval);
    }

    stopLockExtension() {
        if (this.lockExtensionInterval) {
            clearInterval(this.lockExtensionInterval);
            this.lockExtensionInterval = null;
        }
    }

    async processJobs() {
        try {
            // Find pending jobs
            const jobs = await Job.find({
                status: 'pending'
            }).limit(config.PROCESS_BATCH_SIZE);

            if (jobs.length === 0) {
                logger.info(`[${config.INSTANCE_ID}] No pending jobs found`);
                return;
            }

            logger.info(`[${config.INSTANCE_ID}] Found ${jobs.length} jobs to process`);

            // Process each job
            for (const job of jobs) {
                try {
                    // Verify we still own the lock
                    const isOwner = await this.lock.isOwner();
                    if (!isOwner) {
                        throw new Error('Lost lock ownership during processing');
                    }

                    // Mark as processing
                    job.status = 'processing';
                    job.processedBy = config.INSTANCE_ID;
                    await job.save();

                    // Process the job (simulate work)
                    await this.processJob(job);

                    // Mark as completed
                    job.status = 'completed';
                    await job.save();
                    logger.info(`[${config.INSTANCE_ID}] Processed job ${job.jobId}`);
                } catch (err) {
                    logger.error(`[${config.INSTANCE_ID}] Error processing job ${job.jobId}:`, err);
                    job.status = 'failed';
                    await job.save();
                }
            }
        } catch (err) {
            logger.error(`[${config.INSTANCE_ID}] Error finding jobs:`, err);
            throw err;
        }
    }

    async processJob(job) {
        return new Promise(resolve => {
            const processingTime = Math.floor(
                Math.random() * (config.JOB_PROCESSING_TIME_MAX - config.JOB_PROCESSING_TIME_MIN + 1)
            ) + config.JOB_PROCESSING_TIME_MIN;

            setTimeout(() => {
                resolve();
            }, processingTime);
        });
    }
}

module.exports = JobProcessor;