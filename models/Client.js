const mongoose = require('mongoose');
const Utilisateur = require('./Utilisateur');

const clientSchema = new mongoose.Schema({
  cin: { type: String, required: true, unique: true, trim: true },
  telephone: { type: String, required: true, trim: true },
  dateInscription: { type: Date, default: Date.now },
  dateNaissance: { type: Date, required: true },
});

module.exports = Utilisateur.discriminator('Client', clientSchema);
