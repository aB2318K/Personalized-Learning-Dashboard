const mongoose = require('mongoose');

const taskModel = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dueDate: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    completed: { type: Boolean, default: false }, 
    completedAt: { type: Date }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskModel);
