
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: { 
        type: String,
        required: true,
        minlength: 6
    },
    bio: {
        type: String,
        maxlength: 200,
        default: ''
    },
    profilePictureUrl: {
        type: String,
        default: 'https://via.placeholder.com/150' 
    },
    followers: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }],
    following: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);