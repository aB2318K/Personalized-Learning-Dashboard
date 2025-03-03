import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    data: { type: Object, required: true }, 
    category: { type: String, required: true },
    viewedAt: { type: Date, default: Date.now }, 
});

const History = mongoose.model('History', historySchema);

export default History;
