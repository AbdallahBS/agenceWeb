require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const voyageRoutes = require('./routes/voyageRoutes');
const adminVoyageRoutes = require('./routes/adminVoyageRoutes');
const adminHotelRoutes = require('./routes/adminHotelRoutes');
const adminVolRoutes = require('./routes/adminVolRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const paiementRoutes = require('./routes/paiementRoutes');
const avisRoutes = require('./routes/avisRoutes');
const { startReservationExpiryJob } = require('./jobs/reservationExpiryJob');

const app = express();

connectDB();
startReservationExpiryJob();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API Agence de Voyage - bienvenue !' });
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/voyages', voyageRoutes);
app.use('/api/admin/voyages', adminVoyageRoutes);
app.use('/api/admin/hotels', adminHotelRoutes);
app.use('/api/admin/vols', adminVolRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/avis', avisRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Erreur de validation', errors: messages });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: `ID invalide : ${err.value}` });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Valeur déjà existante',
      field: Object.keys(err.keyValue)[0],
    });
  }

  res.status(500).json({ message: err.message || 'Erreur serveur' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
