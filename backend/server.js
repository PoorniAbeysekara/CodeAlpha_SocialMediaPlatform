

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const auth = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB Atlas connected successfully!');
        require('./models/User');     
        require('./models/Profile');  
        require('./models/Post');     
        
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

app.use(express.json());
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/protected', auth, (req, res) => {
    res.json({
        message: 'You have access to protected data!',
        user: req.user
    });
});

app.get('/api', (req, res) => {
    res.send('Social Media Backend API is running!');
});


app.use((err, req, res, next) => {
    console.error(err.stack); 

    
    if (res.headersSent) {
        return next(err);
    }

    // Default to 500 status if no status is set
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Server Error';

    // Send error response as JSON
    res.status(statusCode).json({
        msg: message,
        
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});