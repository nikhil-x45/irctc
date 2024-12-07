const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Register user controller
exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
       
        if (role !== 'admin' && role !== 'user') {
            return res.status(400).json({ message: "Role must be either 'admin' or 'user'" });
        }
        
        const user = await User.createUser(username, email, password, role);
        
        res.status(201).json({
            message: "User registered successfully",
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(400).json({ message: "Registration failed: " + err.message });
    }
};

// Login controller
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(400).json({ message: "Login failed: " + err.message });
    }
};