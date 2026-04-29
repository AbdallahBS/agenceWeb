const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getReservations,
  getReservationById,
  updateReservationStatus,
  deleteReservation,
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('client'), createReservation);
router.get('/mine', protect, authorize('client'), getMyReservations);
router.get('/', protect, authorize('admin', 'gestionnaire'), getReservations);
router.get('/:id', protect, getReservationById);
router.put('/:id/status', protect, authorize('admin', 'gestionnaire'), updateReservationStatus);
router.delete('/:id', protect, authorize('admin', 'gestionnaire'), deleteReservation);

module.exports = router;
