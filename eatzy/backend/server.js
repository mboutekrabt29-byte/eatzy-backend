const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();

/* ================== MIDDLEWARE ================== */
app.use(cors());
app.use(express.json());

/* ================== STATIC FILES ================== */
app.use(
  "/images",
  express.static(path.join(__dirname, "public/images"))
);

/* ================== DATABASE (RAILWAY) ================== */
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  ssl: { rejectUnauthorized: false }
});

db.getConnection(err => {
  if (err) {
    console.error("❌ MySQL error:", err);
    process.exit(1);
  }
  console.log("✅ MySQL connected (Railway)");
});

/* ================== AUTH ================== */
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hash],
    err => {
      if (err) return res.status(400).json({ error: "Email déjà utilisé" });
      res.json({ message: "Compte créé avec succès" });
    }
  );
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (results.length === 0)
        return res.status(401).json({ error: "Email incorrect" });

      const user = results[0];
      const ok = await bcrypt.compare(password, user.password);
      if (!ok)
        return res.status(401).json({ error: "Mot de passe incorrect" });

      delete user.password;
      res.json({ user });
    }
  );
});

/* ================== RESTAURANTS ================== */
app.get("/api/restaurants", (req, res) => {
  db.query("SELECT * FROM restaurants", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ================== AVIS ================== */
app.post("/api/reviews", (req, res) => {
  const { user_id, restaurant_id, rating, comment } = req.body;

  db.query(
    `
    INSERT INTO reviews (user_id, restaurant_id, rating, comment)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      rating = VALUES(rating),
      comment = VALUES(comment)
    `,
    [user_id, restaurant_id, rating, comment],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Avis enregistré" });
    }
  );
});

app.get("/api/restaurants/:id/reviews", (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT r.rating, r.comment, u.name FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.restaurant_id = ?",
    [id],
    (err, reviews) => {
      if (err) return res.status(500).json(err);

      db.query(
        "SELECT ROUND(AVG(rating),1) AS average FROM reviews WHERE restaurant_id = ?",
        [id],
        (err, avg) => {
          res.json({
            average: avg[0].average || 0,
            reviews
          });
        }
      );
    }
  );
});

/* ================== START (RAILWAY) ================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Eatzy backend running on port ${PORT}`);
});
