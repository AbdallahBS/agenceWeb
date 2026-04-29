const express = require('express');
const router = express.Router();
const {
  register,
  login,
  me,
  logout,
  forgotPassword,
  resetPassword,
  bootstrapAdmin,
  createGestionnaire,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/bootstrap-admin', bootstrapAdmin);
router.post('/gestionnaires', protect, authorize('admin'), createGestionnaire);
router.get('/me', protect, me);

module.exports = router;
