const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";

// Route protégée : le JWT doit être présent, correctement signé et non expiré.
// jwt.verify rejette en une seule fois : signature invalide (jeton altéré ou
// forgé) ET expiration dépassée — les deux lèvent une exception ici.
module.exports = function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Authentification requise." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    // TokenExpiredError (expiré) ou JsonWebTokenError (signature invalide,
    // jeton altéré/forgé) : dans les deux cas, on rejette systématiquement.
    return res.status(401).json({ error: "Session expirée ou invalide, reconnectez-vous." });
  }
};
