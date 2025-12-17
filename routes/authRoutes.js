const express = require('express');
const router = express.Router();

const loginController = require('../controllers/loginController'); 
router.post('/login', loginController.handleLogin);
router.post('/logout', loginController.handleLogout);

module.exports = router;