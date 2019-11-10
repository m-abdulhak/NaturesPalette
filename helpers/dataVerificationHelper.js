var express = require('express');
const path = require('path');

const fs = require('fs');
const app = express();

exports.verifyUploadRequest = function(req,err) {
  // verify request has exactly 2 files
  if (!req.files || Object.keys(req.files).length != 2) {
  	err.details = "Wrong number of files selected!"
    return false;
  }

  // verify request has rawFile and metaFile files with correct file types
  if (!req.files.rawFile || path.extname(req.files.rawFile.name) != '.zip') {
  	err.details = "Raw file is missing or selected file type is not supported!"
    return false;
  }
  if (!req.files.metaFile || path.extname(req.files.metaFile.name) != '.csv'  ) {
  	err.details = "Metadata file is missing or selected file type is not supported!"
    return false;
  }

  // TODO: verify request includes expected parameters (fname,lname,metaFile,rawFile,....)
  if (!req.body.fname) {
  	error.details = "Not all required parameters provided!"
    return false;
  }

  // TODO: All Other (online) verifications 

  return true;
}