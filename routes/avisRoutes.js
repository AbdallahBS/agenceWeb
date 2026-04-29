const express = require('express');
const router = express.Router();
const {
  createAvis,
  getAvis,
  getAvisById,
  updateAvis,
  deleteAvis,
} = require('../controllers/avisController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAvis);
router.get('/:id', getAvisById);

router.post('/', protect, authorize('client'), createAvis);
router.put('/:id', protect, authorize('client', 'admin'), updateAvis);
router.delete('/:id', protect, authorize('client', 'admin'), deleteAvis);

module.exports = router;
