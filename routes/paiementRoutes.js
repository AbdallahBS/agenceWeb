const express = require('express');
const router = express.Router();
const {
  createPaiement,
  getPaiements,
  getPaiementById,
  updatePaiement,
  deletePaiement,
  konnectWebhook,
  konnectWebhookGet,
} = require('../controllers/paiementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/konnect/webhook', konnectWebhook);
router.get('/konnect/webhook', konnectWebhookGet);

router.post('/', protect, authorize('admin', 'gestionnaire'), createPaiement);
router.get('/', protect, authorize('admin', 'gestionnaire'), getPaiements);
router.get('/:id', protect, authorize('admin', 'gestionnaire'), getPaiementById);
router.put('/:id', protect, authorize('admin', 'gestionnaire'), updatePaiement);
router.delete('/:id', protect, authorize('admin', 'gestionnaire'), deletePaiement);

module.exports = router;
