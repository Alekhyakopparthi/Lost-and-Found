// backend/routes/items.js
const express = require("express");
const multer = require("multer");
const pool = require("../db");
const path = require("path");
const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* ---------------- UPLOAD ITEM ---------------- */
router.post("/upload", upload.single("image"), async (req, res) => {
  const { type, userId, title, description, contact_name, contact_email, contact_phone } = req.body;
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const imagePath = "/uploads/" + req.file.filename;

  try {
    await pool.query(
      `INSERT INTO items 
        (type, image_path, uploaded_by, title, description, contact_name, contact_email, contact_phone) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [type, imagePath, userId, title, description, contact_name, contact_email, contact_phone]
    );

    res.json({ success: true, path: imagePath });
  } catch (err) {
    console.error("Error inserting item:", err);
    res.status(500).json({ error: "Database error while saving item" });
  }
});

/* ---------------- GET ITEMS BY TYPE ---------------- */
router.get("/:type", async (req, res) => {
  const { type } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM items WHERE type=$1 ORDER BY created_at DESC",
      [type]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Database error while fetching items" });
  }
});

/* ---------------- DELETE ITEM ---------------- */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const item = await pool.query("SELECT * FROM items WHERE id=$1", [id]);
    if (item.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    // check if this user is the uploader
    if (item.rows[0].uploaded_by != userId) {
      return res.status(403).json({ error: "Not authorized to delete this item" });
    }

    await pool.query("DELETE FROM items WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Database error while deleting item" });
  }
});

module.exports = router;
