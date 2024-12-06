const jwt = require('jsonwebtoken');

const userAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // store decoded user info
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Authentication failed" });
    }
};

const adminAuth = async (req, res, next) => {
    try {

        if (!req.user || req.user.role !== 'admin') {
            throw new Error('Admin access required');
        }

        // Verify admin API key
        const apiKey = req.header('x-api-key');
        if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
            throw new Error('Invalid API key');
        }
        
        next();
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

module.exports = {
    userAuth,
    adminAuth
};