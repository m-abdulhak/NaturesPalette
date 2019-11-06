var express = require('express');
const path = require('path');
var SubmissionInfoModel = require('../models/SubmissionInfoModel')

// const testFolder = './uploads/';
const fs = require('fs');
const app = express();

exports.getSubmission = function(req, res) {
console.log("i am in get submission")
  res.render('submissionInfo');
};

exports.postSubmission = function(req, res, next) {
  let sampleFile;
  let uploadPath;
  let name = req.body.name;
  let email = req.body.email;

  SubmissionInfoModel.create({ name:name, email: email }, function (err, awesome_instance) {

 if (err) return handleError(err);
	  console.log("saved!");
	  // saved!
	});

};

