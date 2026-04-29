const Client = require('../models/Client');
const Utilisateur = require('../models/Utilisateur');
const crypto = require('crypto');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/mailer');
const { welcomeEmail, resetPasswordEmail } = require('../utils/emailTemplates');

exports.register = async (req, res, next) => {
  try {
    const {
      prenom,
      nom,
      email,
      password,
      genre,
      cin,
      telephone,
      dateNaissance,
    } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email et mot de passe sont obligatoires' });
    }

    const existing = await Utilisateur.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const client = await Client.create({
      prenom,
      nom,
      email,
      password,
      genre,
      role: 'client',
      cin,
      telephone,
      dateNaissance,
    });

    const { subject, text, html } = welcomeEmail({
      prenom: client.prenom,
      nom: client.nom,
      email: client.email,
    });
    sendEmail({ to: client.email, subject, text, html }).catch((err) =>
      console.error('[register] échec envoi email de bienvenue :', err.message)
    );

    res.status(201).json({
      _id: client._id,
      prenom: client.prenom,
      nom: client.nom,
      email: client.email,
      role: client.role,
      token: generateToken(client._id),
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email et mot de passe sont obligatoires' });
    }

    const user = await Utilisateur.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    res.json({
      _id: user._id,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  res.json(req.user);
};

exports.logout = async (req, res) => {
  res.json({
    message:
      'Deconnexion reussie. Supprimez le token cote client pour terminer la session.',
  });
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email obligatoire' });
    }

    const user = await Utilisateur.findOne({ email });
    if (!user) {
      return res.json({
        message:
          'Si ce compte existe, un email de reinitialisation a ete envoye.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const frontendBaseUrl =
      process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${frontendBaseUrl}/reset-password/${resetToken}`;
    const { subject, text, html } = resetPasswordEmail({
      prenom: user.prenom,
      nom: user.nom,
      resetUrl,
    });

    try {
      await sendEmail({ to: user.email, subject, text, html });
    } catch (emailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(emailErr);
    }

    res.json({
      message:
        'Si ce compte existe, un email de reinitialisation a ete envoye.',
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const rawToken = req.params.token || req.body.token;
    const { password } = req.body;

    if (!rawToken || !password) {
      return res
        .status(400)
        .json({ message: 'Token et nouveau mot de passe sont obligatoires' });
    }

    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: 'Le mot de passe doit contenir au moins 6 caracteres' });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const user = await Utilisateur.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expire' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Mot de passe reinitialise avec succes' });
  } catch (err) {
    next(err);
  }
};

exports.bootstrapAdmin = async (req, res, next) => {
  try {
    const setupKey =
      req.headers['x-admin-setup-key'] ||
      req.body.setupKey ||
      req.query.setupKey;

    if (!process.env.ADMIN_SETUP_KEY) {
      return res.status(500).json({
        message: 'ADMIN_SETUP_KEY manquant dans .env',
      });
    }

    if (!setupKey || setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(401).json({ message: 'Cle de setup admin invalide' });
    }

    const adminCount = await Utilisateur.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return res.status(400).json({
        message:
          'Un admin existe deja. Utilisez un endpoint admin dedie pour en creer d autres.',
      });
    }

    const { prenom, nom, email, password, genre } = req.body;
    if (!prenom || !nom || !email || !password || !genre) {
      return res.status(400).json({
        message: 'prenom, nom, email, password, genre sont obligatoires',
      });
    }

    const existing = await Utilisateur.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email deja utilise' });
    }

    const admin = await Utilisateur.create({
      prenom,
      nom,
      email,
      password,
      genre,
      role: 'admin',
    });

    res.status(201).json({
      _id: admin._id,
      prenom: admin.prenom,
      nom: admin.nom,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
      message: 'Admin cree avec succes',
    });
  } catch (err) {
    next(err);
  }
};

exports.createGestionnaire = async (req, res, next) => {
  try {
    const { prenom, nom, email, password, genre } = req.body;
    if (!prenom || !nom || !email || !password || !genre) {
      return res.status(400).json({
        message: 'prenom, nom, email, password, genre sont obligatoires',
      });
    }

    const existing = await Utilisateur.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email deja utilise' });
    }

    const gestionnaire = await Utilisateur.create({
      prenom,
      nom,
      email,
      password,
      genre,
      role: 'gestionnaire',
    });

    res.status(201).json({
      _id: gestionnaire._id,
      prenom: gestionnaire.prenom,
      nom: gestionnaire.nom,
      email: gestionnaire.email,
      role: gestionnaire.role,
      message: 'Gestionnaire cree avec succes',
    });
  } catch (err) {
    next(err);
  }
};
