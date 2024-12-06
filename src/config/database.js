const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  

  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error connecting to the database:', err.stack);
    }
    console.log('Successfully connected to PostgreSQL database');
    release();
  });

  module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect()
  };