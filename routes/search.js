var express = require('express');
var router = express.Router();

var search_controller = require('../controllers/searchcontroller');

router.get('/', search_controller.getSearch);

router.post('/', search_controller.postSearch);

module.exports = router;
