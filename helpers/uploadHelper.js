var express = require('express');
const path = require('path');

const fs = require('fs');
const app = express();

exports.uploadFileToServer = function(file) {
  let uploadPath = path.dirname(__dirname) + '/uploads/' + file.name;

  file.mv(uploadPath, function(err) {
    if (err) {
      res.render('upload', {filelist: null, moment: moment, error: 'Error, please try again' + err}); 
  	}
  });

  return uploadPath;
}