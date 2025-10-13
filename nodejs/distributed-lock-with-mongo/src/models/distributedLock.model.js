const mongoose = require('mongoose');

const DistributedLockSchema = new mongoose.Schema({
    lockKey: {
        type: String,
        required: true,
        unique: true
    },
    instanceId: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DistributedLock', DistributedLockSchema);