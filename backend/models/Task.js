import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dueDate: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    completed: { type: Boolean, default: false }, 
    completedAt: { type: Date }, 
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
