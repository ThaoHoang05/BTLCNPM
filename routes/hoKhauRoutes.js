const express = require('express');
const router = express.Router();

const hoKhauController = require('../controllers/hoKhauController');

router.get('/dashboard', hoKhauController.getDashboardStats);
router.post('/new', hoKhauController.createHousehold);
router.get('/show', hoKhauController.getHoKhauList);

router.get('/show/:id', hoKhauController.getHouseholdDetail);
router.post('/:id/new', hoKhauController.splitHousehold);
router.patch('/:id/general', hoKhauController.updateGeneralInfo);
router.delete('/:id', hoKhauController.deleteHousehold);
router.get('/:id', hoKhauController.getHouseholdInfo);
router.delete('/:idHK/:idNK', hoKhauController.removeMember);

module.exports = router;