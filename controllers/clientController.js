const Client = require('../models/Client');

exports.createClient = async (req, res, next) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
};

exports.getClients = async (req, res, next) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    next(err);
  }
};

exports.getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json(client);
  } catch (err) {
    next(err);
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json(client);
  } catch (err) {
    next(err);
  }
};

exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json({ message: 'Client supprimé avec succès' });
  } catch (err) {
    next(err);
  }
};
