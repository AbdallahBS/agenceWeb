const mongoose = require('mongoose');

const voyageSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    prix: { type: Number, required: true, min: 0 },
    capacite: { type: Number, required: true, min: 1 },
    capaciteDisponible: { type: Number, min: 0 },
    dateDepart: { type: Date, required: true },
    dateRetour: { type: Date, required: true },
  },
  { timestamps: true }
);

voyageSchema.pre('validate', function (next) {
  if (this.isNew && (this.capaciteDisponible === undefined || this.capaciteDisponible === null)) {
    this.capaciteDisponible = this.capacite;
  }

  if (this.capaciteDisponible > this.capacite) {
    this.invalidate('capaciteDisponible', 'capaciteDisponible ne peut pas depasser capacite');
  }
  next();
});

module.exports = mongoose.model('Voyage', voyageSchema);
