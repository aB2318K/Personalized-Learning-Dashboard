import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
    description: { type: String, required: true },
    answersCount: { type: Number, default: 0 },
}, { timestamps: true }); // Automatically manages createdAt and updatedAt

const Post = mongoose.model('Post', postSchema);

export default Post;
