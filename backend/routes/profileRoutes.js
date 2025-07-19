
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // For protected routes
const { check, validationResult } = require('express-validator');

const Profile = require('../models/Profile'); 
const User = require('../models/User');     
const Post = require('../models/Post');     

// @route    GET api/profile/me
// @desc     Get current user's profile
// @access   Private (only authenticated user can get their own profile)
router.get('/me', auth, async (req, res) => {
    try {
        console.log('Backend: Fetching profile for user ID from token:', req.user.id);

        // CHANGE: Populate 'createdAt' instead of 'date'
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['username', 'createdAt']);

        if (!profile) {
            console.log('Backend: No profile found for user ID:', req.user.id);
            return res.status(404).json({ message: 'There is no profile for this user' });
        }

        console.log('Backend: Profile found for user ID:', req.user.id, profile);
        res.json(profile);
    } catch (err) {
        console.error('Backend Error in GET /api/profile/me:', err.message);
        res.status(500).json({
            msg: 'Server Error',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
    '/',
    auth,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            bio,
            location,
            youtube,
            twitter,
            facebook,
            linkedin,
            instagram,
            profilePictureUrl
        } = req.body;

        const profileFields = {};
        profileFields.user = req.user.id;

        if (bio !== undefined && bio !== null) profileFields.bio = bio;
        if (location !== undefined && location !== null) profileFields.location = location;
        if (profilePictureUrl !== undefined && profilePictureUrl !== null) profileFields.profilePictureUrl = profilePictureUrl;

        profileFields.social = {};
        if (youtube !== undefined && youtube !== null) profileFields.social.youtube = youtube;
        if (twitter !== undefined && twitter !== null) profileFields.social.twitter = twitter;
        if (facebook !== undefined && facebook !== null) profileFields.social.facebook = facebook;
        if (linkedin !== undefined && linkedin !== null) profileFields.social.linkedin = linkedin;
        if (instagram !== undefined && instagram !== null) profileFields.social.instagram = instagram;

        if (Object.keys(profileFields.social).length === 0) {
            delete profileFields.social;
        }

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true, upsert: true, runValidators: true }
                );
                console.log('Backend: Profile updated for user ID:', req.user.id);
                return res.json(profile);
            }

            profile = new Profile(profileFields);
            await profile.save();
            console.log('Backend: New profile created for user ID:', req.user.id);
            res.json(profile);

        } catch (err) {
            console.error('Backend Error in POST /api/profile:', err.message);
            res.status(500).json({
                msg: 'Server Error',
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    }
);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
    try {
        // CHANGE: Populate 'createdAt' instead of 'date'
        const profiles = await Profile.find().populate('user', ['username', 'createdAt']);
        res.json(profiles);
    } catch (err) {
        console.error('Backend Error in GET /api/profile (all profiles):', err.message);
        res.status(500).json({
            msg: 'Server Error',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', async (req, res) => {
    try {
        // CHANGE: Populate 'createdAt' instead of 'date'
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['username', 'createdAt']);

        if (!profile) {
            console.log('Backend: Profile not found for user ID (param):', req.params.user_id);
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error('Backend Error in GET /api/profile/user/:user_id:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(500).json({
            msg: 'Server Error',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete('/', auth, async (req, res) => {
    try {
        await Post.deleteMany({ user: req.user.id });
        console.log('Backend: Posts deleted for user ID:', req.user.id);

        await Profile.findOneAndDelete({ user: req.user.id });
        console.log('Backend: Profile deleted for user ID:', req.user.id);

        await User.findOneAndDelete({ _id: req.user.id });
        console.log('Backend: User account deleted for user ID:', req.user.id);

        res.json({ message: 'User, profile, and posts deleted successfully' });
    } catch (err) {
        console.error('Backend Error in DELETE /api/profile:', err.message);
        res.status(500).json({
            msg: 'Server Error',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

module.exports = router;