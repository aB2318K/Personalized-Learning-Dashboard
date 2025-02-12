const mongoose = require('mongoose');

const postModel = new mongoose.Schema({
    title: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
    description: { type: String, required: true },
    answersCount: { type: Number, default: 0 },
}, { timestamps: true }); // Automatically manages createdAt and updatedAt

module.exports = mongoose.model('Post', postModel);