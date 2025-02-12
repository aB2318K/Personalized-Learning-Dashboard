const mongoose = require('mongoose');

const savedModel = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    data: { type: Object, required: true },
    category: { type: String, required: true },
    watched: { type: Boolean, default: false }, 
    savedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Saved', savedModel);