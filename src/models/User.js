const db = require('../config/db');
const bcrypt = require('bcrypt');

// Create user 
const createUser = async (username, email, password, role) => {

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.query(
        `INSERT INTO users (username, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING user_id, username, email, role`,
        [username, email, hashedPassword, role]
    );

    return result.rows[0];
};

// Find user 
const findByUsername = async (username) => {
    const result = await db.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
    );
    return result.rows[0];
};

module.exports = {
    createUser,
    findByUsername
};