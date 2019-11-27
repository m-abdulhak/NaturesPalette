var express = require('express');
var router = express.Router();

var search_controller = require('../controllers/searchcontroller');

router.get('/', search_controller.getSearch);

router.post('/', search_controller.postSearch);

router.post('/download', search_controller.downloadResults);

module.exports = router;