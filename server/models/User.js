const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Do not return password by default
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lastLoginIP: {
        type: String
    },
    otp: {
        type: String
    },
    otpExpire: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
