const express = require('express');
const { randomUUID } = require('crypto');
const { redisClient } = require('./redis');
const { logger } = require('./logger');

const app = express();
const PORT = process.env.PORT;
const INSTANCE_ID = process.env.INSTANCE_ID || randomUUID();

const LOCK_KEY = process.env.REDIS_LOCK_KEY;
const QUEUE_KEY = process.env.REDIS_JOB_QUEUE_KEY;

const WRITE_INTERVAL_MS = Number(process.env.WRITE_JOBS_INTERVAL_MS);
const PROCESS_INTERVAL_MS = Number(process.env.PROCESS_JOBS_INTERVAL_MS);
const LOCK_TTL = Number(process.env.REDIS_LOCK_TTL_MS);
const LOCK_EXTEND_INTERVAL = Math.floor(
  Number(process.env.REDIS_LOCK_TTL_MS) / 2
);
const BATCH_SIZE = Number(process.env.PROCESS_BATCH_SIZE);
const JOB_PROCESSING_TIME_MIN = Number(process.env.JOB_PROCESSING_TIME_MIN);
const JOB_PROCESSING_TIME_MAX = Number(process.env.JOB_PROCESSING_TIME_MAX);

// Job writing interval
setInterval(async () => {
  const jobId = randomUUID();
  const score = Date.now();
  try {
    await redisClient.zAdd(QUEUE_KEY, [{ score, value: jobId }]);
    logger.info(`Wrote job ${jobId}`);
  } catch (err) {
    logger.error(`Failed to write job`, err);
  }
}, WRITE_INTERVAL_MS);

// Job processing interval
setInterval(async () => {
  try {
    if (await verifyLockOwnership()) {
      logger.debug(`Lock ownership belongs to current node`);
    }

    const gotLock = await tryAcquireLock();
    if (gotLock) {
      logger.info(`Acquired lock`);
      await processJobs();
      await releaseLock();
    } else {
      logger.debug(`Did NOT acquire lock`);
    }
  } catch (err) {
    logger.error(`Processing error`, err);
  }
}, PROCESS_INTERVAL_MS);

async function tryAcquireLock() {
  const result = await redisClient.set(LOCK_KEY, INSTANCE_ID, {
    NX: true,
    PX: LOCK_TTL,
  });
  return result === 'OK';
}

async function releaseLock() {
  const currentValue = await redisClient.get(LOCK_KEY);
  if (currentValue === INSTANCE_ID) {
    await redisClient.del(LOCK_KEY);
    logger.debug(`Released lock`);
  }
}

async function processJobs() {
  let lockExtensionHandle;
  let acquiredJobs = [];

  try {
    // 1. Start TTL extension heartbeat
    lockExtensionHandle = setInterval(async () => {
      try {
        const extended = await redisClient.set(LOCK_KEY, INSTANCE_ID, {
          XX: true, // Only if key exists
          PX: LOCK_TTL,
        });
        if (extended !== 'OK') {
          throw new Error('Lock ownership lost');
        }
        logger.info(`Extended distributed lock for ${LOCK_TTL}ms`);
      } catch (err) {
        logger.error('Lock extension failed', err);
        if (lockExtensionHandle) clearInterval(lockExtensionHandle);
        throw err; // Break processing loop
      }
    }, LOCK_EXTEND_INTERVAL);

    // 2. Claim a batch of jobs (without removing)
    acquiredJobs = await redisClient.zRange(QUEUE_KEY, 0, BATCH_SIZE - 1);
    if (acquiredJobs.length === 0) {
      logger.info('No jobs available');
      return;
    }
    logger.info(`Claimed ${acquiredJobs.length} jobs for processing`);

    let completedJobs = 0;
    const totalJobs = acquiredJobs.length;

    // 3. Process jobs one by one
    for (const job of acquiredJobs) {
      try {
        // Verify we still hold the lock
        if (!(await verifyLockOwnership())) {
          throw new Error('Lost lock ownership');
        }

        await processJob(job);

        // Only remove after successful processing
        await redisClient.zRem(QUEUE_KEY, job);

        completedJobs++;
        logger.info(
          `Job progress: ${completedJobs}/${totalJobs} (${Math.round((completedJobs / totalJobs) * 100)}%)`
        );
      } catch (err) {
        logger.error(`Failed to process job ${job}`, err);
        // Continue with next job despite failure
      }
    }
  } catch (err) {
    logger.error('Processing error', err);
  } finally {
    // 4. Cleanup
    if (lockExtensionHandle) clearInterval(lockExtensionHandle);
    await releaseLock();
    logger.info('Processing batch completed');
  }
}

async function verifyLockOwnership() {
  const currentValue = await redisClient.get(LOCK_KEY);
  return currentValue === INSTANCE_ID;
}

function processJob(job) {
  logger.info(`Processing job ${job}`);

  return new Promise(resolve => {
    const processingTime =
      Math.floor(
        Math.random() * (JOB_PROCESSING_TIME_MAX - JOB_PROCESSING_TIME_MIN + 1)
      ) + JOB_PROCESSING_TIME_MIN;
    setTimeout(() => {
      // Your job processing logic here
      logger.debug(`Completed job ${job} - (${processingTime}ms)`);
      resolve(); // Added missing resolve
    }, processingTime);
  });
}

async function cleanupStaleLocks() {
  const currentLock = await redisClient.get(LOCK_KEY);
  if (currentLock && currentLock.startsWith(INSTANCE_ID)) {
    await redisClient.del(LOCK_KEY);
  }
}

app.listen(PORT, async () => {
  await cleanupStaleLocks();
  logger.info(`App listening on port ${PORT}`);
});
