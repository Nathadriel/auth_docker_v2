const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser()); // nécessaire pour lire le cookie contenant le JWT

app.use(express.static(path.join(__dirname, "public")));

app.use("/api", authRoutes);
app.use("/api/articles", articleRoutes);

app.listen(PORT, () => {
  console.log(`SecureBlog (v2 - JWT) en écoute sur le port ${PORT}`);
});
