import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
    voteType: { type: String, enum: ['upvote', 'downvote'], required: true },  
}, { _id: false });  // Prevent an automatic _id for each vote entry

const postAnswerSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },  
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
    answer: { type: String, required: true },  
    upvotes: { type: Number, default: 0 },  
    downvotes: { type: Number, default: 0 }, 
    votes: [voteSchema],  
}, { timestamps: true });

const PostAnswer = mongoose.model('PostAnswer', postAnswerSchema);

export default PostAnswer;
