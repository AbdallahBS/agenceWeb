const express = require('express');
const router = express.Router();
const {
  createVoyage,
  getVoyages,
  getVoyageById,
  updateVoyage,
  deleteVoyage,
} = require('../controllers/voyageController');

router.post('/', createVoyage);
router.get('/', getVoyages);
router.get('/:id', getVoyageById);
router.put('/:id', updateVoyage);
router.delete('/:id', deleteVoyage);

module.exports = router;
