import mongoose from 'mongoose';

const savedSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    data: { type: Object, required: true },
    category: { type: String, required: true },
    watched: { type: Boolean, default: false }, 
    savedAt: { type: Date, default: Date.now },
});

const Saved = mongoose.model('Saved', savedSchema);

export default Saved;
