var express = require('express');
var router = express.Router();

var upload_controller = require('../controllers/uploadcontroller');

/* GET home page. */
router.get('/', upload_controller.getUploads);


router.post('/', upload_controller.postUpload);

module.exports = router;
