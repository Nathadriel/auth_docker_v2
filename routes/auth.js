const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { users, nextUserId } = require("../store");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
const SALT_ROUNDS = 10;

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m"; // expiration courte, comme recommandé

const cookieOptions = {
  httpOnly: true, // inaccessible en JavaScript côté client (pas de localStorage)
  secure: process.env.NODE_ENV === "production", // HTTPS uniquement en prod
  sameSite: "lax",
  maxAge: 15 * 60 * 1000, // doit correspondre à JWT_EXPIRES_IN (15 min ici)
};

// POST /api/register : hachage bcrypt du mot de passe, création de l'utilisateur
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
  }
  if (users.some((u) => u.email === email)) {
    return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  users.push({ id: nextUserId(), email, passwordHash });

  res.status(201).json({ message: "Compte créé avec succès." });
});

// POST /api/login : vérification par bcrypt.compare, génération d'un JWT signé
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);

  const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!isValid) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }

  // Le JWT est auto-porteur et signé : le serveur n'a plus rien à stocker
  // (API stateless). Ne jamais mettre de donnée sensible dans le payload,
  // il est seulement encodé en base64url, pas chiffré.
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.cookie("token", token, cookieOptions);
  res.json({ message: "Connexion réussie.", email: user.email });
});

// GET /api/me : route protégée par le middleware requireAuth (vérifie le JWT)
router.get("/me", requireAuth, (req, res) => {
  res.json({ email: req.user.email });
});

// POST /api/logout : supprime le cookie contenant le JWT
router.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Déconnecté." });
});

module.exports = router;
