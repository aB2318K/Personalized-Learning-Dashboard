const mongoose = require('mongoose');

const historyModel = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    data: { type: Object, required: true }, 
    category: { type: String, required: true },
    viewedAt: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('History', historyModel);