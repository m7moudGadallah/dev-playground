const {randomUUID} = require('crypto');

class MongoDistributedLock {
    /**
     * @param {mongoose.Model} lockModel - Mongoose model for locks
     * @param {object} options
     * @param {string} [options.instanceId] - Unique ID for this instance
     * @param {number} [options.ttl=5000] - Lock time-to-live in ms
     */
    constructor(lockModel, options = {}) {
        this.lockModel = lockModel;
        this.instanceId = options.instanceId || this._generateId();
    }

    _generateId() {
        return randomUUID();
    }

    async acquire() {
        const session = await this.lockModel.db.startSession();
        let acquired = false;

        try {
            await session.withTransaction(async () => {
                const lock = await this.lockModel.findOne(
                    { lockKey: this.lockKey },
                    null,
                    { session }
                );

                if (!lock || new Date(lock.expiresAt) < new Date()) {
                    await this.lockModel.findOneAndUpdate(
                        { lockKey: this.lockKey },
                        {
                            lockKey: this.lockKey,
                            instanceId: this.instanceId,
                            expiresAt: new Date(Date.now() + this.ttl)
                        },
                        { upsert: true, session, new: true }
                    );
                    acquired = true;
                }
            });
        } finally {
            await session.endSession();
        }

        return acquired;
    }

    async release() {
        const session = await this.lockModel.db.startSession();
        let released = false;

        try {
            await session.withTransaction(async () => {
                const lock = await this.lockModel.findOne(
                    { lockKey: this.lockKey },
                    null,
                    { session }
                );

                if (lock && lock.instanceId === this.instanceId) {
                    await this.lockModel.deleteOne(
                        { lockKey: this.lockKey },
                        { session }
                    );
                    released = true;
                    this._stopExtension();
                }
            });
        } finally {
            await session.endSession();
        }

        return released;
    }

    async isOwner() {
        const lock = await this.lockModel.findOne({ lockKey: this.lockKey });
        return lock && lock.instanceId === this.instanceId;
    }

    async extend() {
        const session = await this.lockModel.db.startSession();
        let extended = false;

        try {
            await session.withTransaction(async () => {
                const result = await this.lockModel.updateOne(
                    {
                        lockKey: this.lockKey,
                        instanceId: this.instanceId
                    },
                    { expiresAt: new Date(Date.now() + this.ttl) },
                    { session }
                );
                extended = result.modifiedCount > 0;
            });
        } finally {
            await session.endSession();
        }

        return extended;
    }
}

module.exports = { MongoDistributedLock };