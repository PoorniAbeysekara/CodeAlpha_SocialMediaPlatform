const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/authMiddleware'); 
const Post = require('../models/Post');             
const User = require('../models/User');             

// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post(
    '/',
    auth,
    check('text', 'Text is required').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');

            const newPost = new Post({
                text: req.body.text,
                imageUrl: req.body.imageUrl, 
                user: req.user.id,
                
            });

            const post = await newPost.save();

            
            await post.populate('user', ['username']);

            res.json(post);
        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Server Error' });
        }
    }
);

// @route    GET api/posts
// @desc     Get all posts
// @access   Public (or Private if you want only logged-in users to see feed)
router.get('/', async (req, res) => {
    try {
        
        const posts = await Post.find().sort({ date: -1 }).populate('user', ['username']); // Populate username
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server Error' });
    }
});

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Public
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user', ['username']);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Post not found' });
        }
        return res.status(500).json({ message: 'Server Error' });
    }
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await post.deleteOne(); // Use deleteOne() instead of remove()
        res.json({ message: 'Post removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Post not found' });
        }
        return res.status(500).json({ message: 'Server Error' });
    }
});

// @route    PUT api/posts/like/:id
// @desc     Like or Unlike a post
// @access   Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        
        if (post.likes.some(like => like.user.toString() === req.user.id)) {
            
            post.likes = post.likes.filter(
                ({ user }) => user.toString() !== req.user.id
            );
            console.log(`User ${req.user.id} unliked post ${req.params.id}`);
            await post.save();
            return res.json({ message: 'Post unliked', likes: post.likes });
        }

        // If it's not liked, add the like
        post.likes.unshift({ user: req.user.id }); 
        console.log(`User ${req.user.id} liked post ${req.params.id}`);
        await post.save();
        return res.json({ message: 'Post liked', likes: post.likes });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Post not found' });
        }
        return res.status(500).json({ message: 'Server Error' });
    }
});

// @route    POST api/posts/comment/:id
// @desc     Add a comment to a post
// @access   Private
router.post('/comment/:id', auth,
    check('text', 'Text is required for a comment').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            const newComment = {
                user: req.user.id,
                text: req.body.text,
                username: user.username, // 
                date: Date.now()
            };

            post.comments.unshift(newComment);

            await post.save();

            await post.populate('comments.user', ['username']);

            return res.json(post.comments); //

        } catch (err) {
            console.error(err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ message: 'Post not found' });
            }
            return res.status(500).json({ message: 'Server Error' });
        }
    }
);

// @route    DELETE api/posts/comment/:post_id/:comment_id
// @desc     Delete a comment from a post
// @access   Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Find the comment by its ID
        const comment = post.comments.find(
            (comment) => comment.id.toString() === req.params.comment_id
        );

        // Check if comment exists
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check user (only the user who made the comment can delete it)
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Get the remove index
        const removeIndex = post.comments
            .map((comment) => comment.id.toString())
            .indexOf(req.params.comment_id);

        post.comments.splice(removeIndex, 1); 

        await post.save();
        res.json({ message: 'Comment removed', comments: post.comments });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Post or Comment not found' });
        }
        res.status(500).send('Server Error');
    }
});


module.exports = router;