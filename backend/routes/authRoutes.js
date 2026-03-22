const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../src/middleware/authenticate');

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.perfil)

module.exports = router;