import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  savedVideoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Saved', required: true },
  feedbackText: { type: String, required: true, minlength: 1, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

feedbackSchema.index({ userId: 1, savedVideoId: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
