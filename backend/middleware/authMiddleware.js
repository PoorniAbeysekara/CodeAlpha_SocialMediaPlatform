const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET; 


module.exports = function (req, res, next) {
    
    const authHeader = req.header('Authorization');

    console.log("Backend received Authorization Header:", authHeader); 

    if (!authHeader || !authHeader.startsWith('Bearer ')) { 
        console.log("Backend: No Bearer token found or Authorization header is missing."); 
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    
    const token = authHeader.split(' ')[1]; 

 
    console.log("Backend extracted token:", token); //


    try {
   
        const decoded = jwt.verify(token, jwtSecret);

 
        req.user = decoded.user;
        
    
        console.log("Backend: Token successfully verified for user ID:", req.user.id); 
        next(); 
    } catch (err) {
      
        console.error('Backend: Token verification failed:', err.message); 
        res.status(401).json({ message: 'Token is not valid' });
    }
};