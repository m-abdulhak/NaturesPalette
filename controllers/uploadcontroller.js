var express = require('express');
const path = require('path');
var MetaDataModel = require('../models/metadatamodel')

const testFolder = './uploads/';
const fs = require('fs');
const app = express();


exports.startUpload = function(req, res) {
  res.render('startUpload', {error: null});
};

exports.getUpload = function(req, res) {
  let filenames = get_files();

  res.render('upload', {filelist: filenames, error: null});
};

exports.postUpload = function(req, res, next) {
  let sampleFile;
  let uploadPath;
	
  console.log('req.files >>>', req.files); // eslint-disable-line

  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send('No files were uploaded.');
    return;
  }
  
  sampleFile = req.files.sampleFile;

  uploadPath = path.dirname(__dirname) + '/uploads/' + sampleFile.name;

  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      res.render('upload', {filelist: null, error: 'Error, please try again' + err});
    }

    let filenames = get_files();

    MetaDataModel.create({ fileName: sampleFile.name, fileUrl: uploadPath }, function (err, awesome_instance) {
	  if (err) return handleError(err);
	  console.log("saved!");
	  // saved!
	});
  
    res.render('upload', {filelist: filenames, error: null});
      
  });
};

function get_files(argument) {
  let filenames = [];

  fs.readdirSync(testFolder).forEach(file => {
    //console.log(file);
    filenames.push(file);
  });

  return filenames;
}