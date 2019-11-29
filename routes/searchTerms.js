var express = require('express');
var router = express.Router();

var searchTerms_controller = require('../controllers/searchtermscontroller');

router.get('/', searchTerms_controller.getSearchTerms);

router.post('/', searchTerms_controller.editSearchTerm);

router.get('/add', searchTerms_controller.getSearchTerms);

router.post('/add', searchTerms_controller.addSearchTerm);


module.exports = router;
