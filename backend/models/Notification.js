const mongoose = require('mongoose');

const notificationModel = new mongoose.Schema({
    type: { type: String, enum: ['question', 'answer'], required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
    answerId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostAnswer' }, 
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationModel);
