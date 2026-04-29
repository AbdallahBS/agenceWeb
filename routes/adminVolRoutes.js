const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createVol,
  getVols,
  getVolById,
  updateVol,
  deleteVol,
} = require('../controllers/volController');

router.use(protect, authorize('admin', 'gestionnaire'));

router.post('/', createVol);
router.get('/', getVols);
router.get('/:id', getVolById);
router.put('/:id', updateVol);
router.delete('/:id', deleteVol);

module.exports = router;
