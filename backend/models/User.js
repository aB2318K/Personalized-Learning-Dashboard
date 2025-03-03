import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: { type: String },
    resetId: { type: String, default: null, sparse: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
