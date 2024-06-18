const { Pool } = require('pg');

const pool = new Pool({
  user: 'ecommerce_user',
  host: 'localhost',
  database: 'ecommerce_db',
  password: 'password',
  port: 5432,
});

module.exports = pool;
