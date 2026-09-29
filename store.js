// Stockage en mémoire — simple pour le TP, à remplacer par une vraie base
// de données (Mongo, Postgres...) dans un projet réel.
const users = [];
const articles = [];

let userSeq = 1;
let articleSeq = 1;

module.exports = {
  users,
  articles,
  nextUserId: () => userSeq++,
  nextArticleId: () => articleSeq++,
};
