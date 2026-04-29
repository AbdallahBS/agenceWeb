const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Accès refusé : aucun token fourni' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Utilisateur.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Utilisateur introuvable pour ce token' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Accès interdit : rôle non autorisé' });
    }
    next();
  };
};
