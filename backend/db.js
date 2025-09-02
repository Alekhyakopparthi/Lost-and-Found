// backend/db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",      // change this
  host: "localhost",
  database: "lost_found",
  password: "bittu", // change this
  port: 5432,
});

module.exports = pool;
