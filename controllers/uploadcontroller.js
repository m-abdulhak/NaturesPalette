var express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');
const moment = require('moment');
var mongoose = require('mongoose');

var uploadHelper = require('../helpers/uploadHelper');
var verifyHelper = require('../helpers/dataVerificationHelper');
var zipHelper = require('../helpers/zipHelper');

var SubmissionModel = require('../models/SubmissionModel');
var SubmissionInfoModel = require('../models/SubmissionInfoModel');
var MetaDataFileModel = require('../models/MetaDataFileModel');
var RawFileModel = require('../models/RawFileModel');

exports.startUpload = function(req, res) {
  res.render('startUpload', {error: null});
};

exports.getUpload = function(req, res) {
  let filenames = get_files();

  res.render('upload', {filelist: filenames, moment: moment, error: null});
};

exports.postUpload = function(req, res, next) {
  // verify request parameters 
  err = {};
  if(!verifyHelper.verifyUploadRequest(req,err)){
    res.status(403).send("No files were uploaded! Error Occured: " + err.details);
    return;
  }

  // create all needed objects for the upload process
  let uploadSet = createUploadObjectsSet();

  // set submissionInfo object from request paramters
  uploadSet.submissionInfo = extractSubmissionInfoFromReqBody(req.body);

  // create MetaFile object, upload meta file to server, set path and generate new _id 
  // TODO: metafile path not present in schema? extract and delete?
  uploadSet.metaFile.path = uploadHelper.uploadFileToServer(req.files.metaFile, function(err) {
    if (err){
      console.log("Error with meta file upload!"); 
      res.status(403).send("No files were uploaded! Error Occured: " + err.details);
    }

    // create RawFile object, upload raw file to server, set path and generate new _id 
    uploadSet.rawFile.path = uploadHelper.uploadFileToServer(req.files.rawFile,function(err) {
      if (err){
        console.log("Error with raw file upload!"); 
        res.status(403).send("No files were uploaded! Error Occured: " + err.details);
      }
        
      var rawFilesInZip = zipHelper.getFileNamesInZip(uploadSet.rawFile.path);
      console.log(rawFilesInZip);

      rawFilesInZip.forEach(function(zipEntry) {
        console.log(zipEntry);
      }); 

      if (saveUploadObjectsToDB(uploadSet)){
        res.send("Data Uploaded Successfully! Confirmation Email will be sent soon!");
      }

      });
  });  
};

function createUploadObjectsSet() {
  let uploadSet = {};
  // create submission object and set all ids 
  uploadSet.submission = {};
  uploadSet.submission._id = mongoose.Types.ObjectId();

  uploadSet.metaFile = {};
  uploadSet.metaFile._id = mongoose.Types.ObjectId();
  uploadSet.metaFile.submissionId =uploadSet.submission._id;

  uploadSet.rawFile = {};
  uploadSet.rawFile._id = mongoose.Types.ObjectId();
  uploadSet.rawFile.submissionId =uploadSet.submission._id;

  uploadSet.submissionInfo = {};
  uploadSet.submissionInfo._id = mongoose.Types.ObjectId();
  uploadSet.submissionInfo.submissionId =uploadSet.submission._id;

  // set all ids into submission  
  uploadSet.submission.submissionInfoId = uploadSet.submissionInfo._id;
  uploadSet.submission.rawFileId = uploadSet.rawFile._id;
  uploadSet.submission.metaDataFileId = uploadSet.metaFile._id;

  return uploadSet;
}

function saveUploadObjectsToDB(uploadSet) {
  SubmissionModel.create(uploadSet.submission, function (err, submission_instance) {
    if (err){
      console.log("submission save ERROR! " + err);
      return false;
    }
  });

  SubmissionInfoModel.create(uploadSet.submissionInfo, function (err, submissionInfo_instance) {
    if (err){
      console.log("submissionInfo save ERROR! " + err);
      return false;
    }
  });

  MetaDataFileModel.create(uploadSet.metaFile, function (err, metaFile_instance) {
    if (err) {
      console.log("metaFile save ERROR! " + err);
      return false;
    }
  });

  RawFileModel.create(uploadSet.rawFile, function (err, rawFile_instance) {
    if (err){
      console.log("rawFile save ERROR! " + err);
      return false;
    }
  });

  return true;
}

// get all filse within folder (for testing only)
// TODO: remove after finishing testing
const testFolder = './uploads/';
function get_files(argument) {
  let filenames = [];

  fs.readdirSync(testFolder).forEach(file => {
    //console.log(file);
    filenames.push(file);
  });

  return filenames;
}

// TODO: move to helper?
function extractSubmissionInfoFromReqBody(requestBody){
  let submissionInfo = {};

  // TODO: Extract All parameters 
  submissionInfo.name = requestBody.fname;
  submissionInfo.email = requestBody.email;

  return submissionInfo; 
}