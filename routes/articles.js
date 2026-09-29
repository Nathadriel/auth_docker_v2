const express = require("express");
const { articles, nextArticleId } = require("../store");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// Toutes les routes ci-dessous exigent un JWT valide et non expiré
router.use(requireAuth);

// req.user vient du payload du JWT vérifié par requireAuth — pas d'état
// côté serveur (contrairement à req.session dans la v1).
router.get("/", (req, res) => {
  const mine = articles
    .filter((a) => a.userId === req.user.id)
    .sort((a, b) => b.createdAt - a.createdAt);
  res.json(mine);
});

router.post("/", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Titre et contenu requis." });
  }

  const article = {
    id: nextArticleId(),
    userId: req.user.id,
    title,
    content,
    createdAt: new Date(),
  };
  articles.push(article);
  res.status(201).json(article);
});

module.exports = router;
