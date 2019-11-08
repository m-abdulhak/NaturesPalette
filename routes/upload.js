var express = require('express');
var router = express.Router();

var upload_controller = require('../controllers/uploadcontroller');

router.get('/startUpload', upload_controller.startUpload);

router.get('/', upload_controller.getUpload);

router.post('/', upload_controller.postUpload);

module.exports = router;
