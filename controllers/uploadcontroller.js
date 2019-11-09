var express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');
const moment = require('moment');
var mongoose = require('mongoose');

var uploadHelper = require('../helpers/uploadHelper');

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
  if(!verifyUploadParameters(req))
    res.status(400).send('No files were uploaded.');

  // create submission object and set all ids 
  let submissionInstance = {};
  submissionInstance._id = mongoose.Types.ObjectId();

  // create submissionInfo object from request paramters and generate new _id 
  let submissionInfoInstance = extractSubmissionInfoFromReqBody(req.body);
  submissionInfoInstance._id = mongoose.Types.ObjectId();
  submissionInfoInstance.submissionId =submissionInstance._id;

  // create MetaFile object, upload meta file to server, set path and generate new _id 
  // TODO: metafile path not present in schema? extract and delete?
  let metaFileInstance = {};
  metaFileInstance.path = uploadHelper.uploadFileToServer(req.files.metaFile); 
  metaFileInstance._id = mongoose.Types.ObjectId();
  metaFileInstance.submissionId =submissionInstance._id;

  // create RawFile object, upload raw file to server, set path and generate new _id 
  let rawFileInstance = {};
  rawFileInstance.path = uploadHelper.uploadFileToServer(req.files.rawFile);
  rawFileInstance._id = mongoose.Types.ObjectId();
  rawFileInstance.submissionId =submissionInstance._id;

  // set all ids into submission instance 
  submissionInstance.submissionInfoId = submissionInfoInstance._id;
  submissionInstance.rawFileId = rawFileInstance._id;
  submissionInstance.metaDataFileId = metaFileInstance._id;
  
  SubmissionModel.create(submissionInstance, function (err, submission_instance) {
    if (err)
      console.log("submissionInstance save ERROR! " + err);
  });

  SubmissionInfoModel.create(submissionInfoInstance, function (err, submissionInfo_instance) {
    if (err)
      console.log("submissionInfoInstance save ERROR! " + err);
  });

  MetaDataFileModel.create(metaFileInstance, function (err, metaFile_instance) {
    if (err) 
      console.log("metaFileInstance save ERROR! " + err);
  });

  RawFileModel.create(rawFileInstance, function (err, rawFile_instance) {
    if (err)
      console.log("rawFileInstance save ERROR! " + err);
  });

  res.render('index', {notice: "Data Uploaded Successfully! Confirmation Email will be sent soon!", error: null});
};

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
function verifyUploadParameters(req){
  // verify request has exactly 2 files
  if (!req.files || Object.keys(req.files).length != 2) {
    return false;
  }

  // TODO: verify request includes expected parameters (fname,lname,metaFile,rawFile,....)

  // TODO: verify metaFile type is csv

  // TODO: verify rawFile type is zip 

  // TODO: All Other (online) verifications 

  return true;
}

// TODO: move to helper?
function extractSubmissionInfoFromReqBody(requestBody){
  let submissionInfo = {};

  // TODO: Extract All parameters 
  submissionInfo.name = requestBody.fname;
  submissionInfo.email = requestBody.email;

  return submissionInfo; 
}