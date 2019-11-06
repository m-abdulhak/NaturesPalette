var express = require('express');
var router = express.Router();

var submissionInfoController = require('../controllers/SubmissionInfoController');

/* GET home page. */
router.get('/', submissionInfoController.getSubmission);


router.post('/', submissionInfoController.postSubmission);

module.exports = router;
