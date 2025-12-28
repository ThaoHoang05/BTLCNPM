const express = require('express');
const router = express.Router();

const nhaVanHoaController = require('../controllers/nhaVanHoaController');

router.get('/asset', nhaVanHoaController.getAssets);
router.post('/asset/new', nhaVanHoaController.addAsset);
router.patch('/asset/:id', nhaVanHoaController.updateAsset);
router.delete('/asset/:id', nhaVanHoaController.deleteAsset);

router.get('/HDchung', nhaVanHoaController.getUpcomingActivities);
router.post('/HDchung/new', nhaVanHoaController.addCommonActivity);

router.get('/rooms', nhaVanHoaController.getRooms);

module.exports = router;