// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const router = express.Router();

// Signup
// backend/routes/auth.js
// backend/routes/auth.js
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [username, hashed]
    );
    res.json({ success: true, userId: result.rows[0].id });
  } catch (err) {
    console.error("Signup error:", err); // log actual error in console

    if (err.code === "23505") {
      // Unique violation (duplicate username)
      res.status(400).json({ error: "User already exists" });
    } else {
      res.status(500).json({ error: "Database error: " + err.message });
    }
  }
});



// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
  if (result.rows.length === 0) return res.status(400).json({ error: "User not found" });

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Wrong password" });

  res.json({ success: true, userId: user.id, username: user.username });
});

module.exports = router;
