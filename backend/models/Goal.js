import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },      
    dueDate: { type: Date, required: true },    
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    completed: { type: Boolean, default: false }, 
    completedAt: { type: Date }, 
  },
  { timestamps: true }
);

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
