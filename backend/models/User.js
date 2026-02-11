import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { type: String, required: true, minlength: 6 },
    userType: {
        type: String,
        required: true,
        enum: ['buyer', 'seller', 'admin', 'client']
    },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    isLoggedIn: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date
});

UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

const User = mongoose.model("User", UserSchema);

export default User;
