const express = require('express');
const { userTaskController } = require('../controller');

const router = express.Router();

router.get('/playlist-length', userTaskController.playlistLength);

module.exports = router;
