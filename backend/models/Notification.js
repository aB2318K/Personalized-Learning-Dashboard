import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    type: { type: String, enum: ['question', 'answer'], required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
    answerId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostAnswer' }, 
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
