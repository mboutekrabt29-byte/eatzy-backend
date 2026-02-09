const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 3000;

/* ================== MIDDLEWARE ================== */
app.use(cors());
app.use(express.json());

/* ================== STATIC FILES (IMAGES) ================== */
app.use(
  "/images",
  express.static(path.join(__dirname, "public/images"))
);

/* ================== DATABASE ================== */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "eatzy"
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL error:", err);
    process.exit(1);
  }
  console.log("✅ MySQL connected");
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

/* ================== COMMANDES (DEMO) ================== */
let orders = [];

app.post("/api/orders", (req, res) => {
  const order = {
    id: Date.now(),
    ...req.body,
    status: "preparing",
    createdAt: new Date()
  };
  orders.push(order);
  res.json(order);
});

app.get("/api/orders/:id", (req, res) => {
  const order = orders.find(o => o.id == req.params.id);
  if (!order) return res.status(404).json({ error: "Commande introuvable" });
  res.json(order);
});
/* ================== AVIS & NOTES ================== */

// Ajouter / remplacer un avis
app.post("/api/reviews", (req, res) => {
  const { user_id, restaurant_id, rating, comment } = req.body;

  if (!user_id || !restaurant_id || !rating) {
    return res.status(400).json({ error: "Données manquantes" });
  }

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

// Récupérer avis + moyenne
app.get("/api/restaurants/:id/reviews", (req, res) => {
  const restaurantId = req.params.id;

  db.query(
    `
    SELECT 
      r.rating,
      r.comment,
      u.name
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.restaurant_id = ?
    `,
    [restaurantId],
    (err, reviews) => {
      if (err) return res.status(500).json(err);

      db.query(
        `
        SELECT ROUND(AVG(rating), 1) AS average
        FROM reviews
        WHERE restaurant_id = ?
        `,
        [restaurantId],
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


/* ================== START ================== */
app.listen(PORT, () =>
  console.log(`🚀 Eatzy backend prêt → http://localhost:${PORT}`)
);
