const express = require('express');
const mongoose = require('mongoose');
const config = require('./utils/config.util');
const logger = require('./utils/logger.util');
const { setTimeout } = require('timers/promises');

// Configure Mongoose settings
mongoose.set('strictQuery', false);

const app = express();
const MAX_RETRY_ATTEMPTS = parseInt(process.env.MAX_RETRY_ATTEMPTS) || 30;
const RETRY_DELAY_MS = parseInt(process.env.RETRY_DELAY_MS) || 5000;

const connectWithRetry = async (attempt = 1) => {
    try {
        logger.info(`[${config.INSTANCE_ID}] MongoDB connection attempt ${attempt}`);

        await mongoose.connect(config.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            retryWrites: true,
            retryReads: true,
            replicaSet: 'rs0'
        });

        logger.info(`[${config.INSTANCE_ID}] Successfully connected to MongoDB`);
        return true;
    } catch (err) {
        if (attempt >= MAX_RETRY_ATTEMPTS) {
            logger.error(`[${config.INSTANCE_ID}] Maximum connection attempts reached`);
            throw err;
        }

        logger.warn(
            `[${config.INSTANCE_ID}] MongoDB connection failed (attempt ${attempt}). Retrying in ${RETRY_DELAY_MS/1000} seconds...`,
            err.message
        );

        await setTimeout(RETRY_DELAY_MS);
        return connectWithRetry(attempt + 1);
    }
};

const startApplication = async () => {
    try {
        await connectWithRetry();

        // Start your services
        require('./services/JobWriter.service');
        const jobProcessor = require('./services/jobProcessor.service');

        const server = app.listen(config.PORT, () => {
            logger.info(`[${config.INSTANCE_ID}] Server running on port ${config.PORT}`);
        });

        // Graceful shutdown
        const shutdown = async () => {
            logger.info(`[${config.INSTANCE_ID}] Shutting down...`);
            jobProcessor.stopLockExtension();
            await new Promise(resolve => server.close(resolve));
            await mongoose.connection.close();
            process.exit(0);
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

        // Health check endpoint
        app.get('/health', (req, res) => {
            const status = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
            res.json({ status, instanceId: config.INSTANCE_ID });
        });

    } catch (err) {
        logger.error(`[${config.INSTANCE_ID}] Application startup failed:`, err);
        process.exit(1);
    }
};

startApplication();

module.exports = app;