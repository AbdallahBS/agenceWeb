const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createVoyage,
  getVoyages,
  getVoyageById,
  updateVoyage,
  deleteVoyage,
} = require('../controllers/voyageController');

router.use(protect, authorize('admin', 'gestionnaire'));

router.post('/', createVoyage);
router.get('/', getVoyages);
router.get('/:id', getVoyageById);
router.put('/:id', updateVoyage);
router.delete('/:id', deleteVoyage);

module.exports = router;
