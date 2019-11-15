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
  let filenames = {};

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

  // upload meta file to server
  // TODO: metafile path not present in schema? extract and delete?
  uploadSet.metaFile.path = uploadHelper.uploadFileToServer(req.files.metaFile, function(err) {
    if (err){
      console.log("Error with meta file upload!"); 
      res.status(403).send("No files were uploaded! Error Occured: " + err.details);
      return;
    }

    // TODO: Do meta file header validations here
    var metaFieldsError = {};
    if (!verifyHelper.verifyMetaFileHeaderFields(uploadSet.submissionInfo.dataFrom,uploadSet.metaFile.path,metaFieldsError)){
      console.log("Error with meta file header!"); 
      res.status(403).send("No files were uploaded! Error Occured: " + metaFieldsError.details);
      return;
    }

    // upload raw file to server 
    uploadSet.rawFile.path = uploadHelper.uploadFileToServer(req.files.rawFile,function(err) {
      if (err){
        console.log("Error with raw file upload!"); 
        res.status(403).send("No files were uploaded! Error Occured: " + err.details);
        return;
      }
      
      // TODO: Do meta file rows validation against raw files here
  
      // TODO: Get list of all rows in meta file

      // TOFO: Validate that all met file rows contain required values

      // TODO: validate that raw files in zip file and the meta file rows match, 
      // use this function to get list of raw files in zip:
      // var rawFileNamesInZip = zipHelper.getFileNamesInZip(uploadSet.rawFile.path);

      //console.log(rawFilesInZip);

      var rawFilesInZip = zipHelper.unzip(uploadSet.rawFile.path);
      //console.log(rawFilesInZip);

      // extract all raw files from zip
      rawFilesInZip.forEach(function(zipEntry) {
        console.log(zipEntry);
      }); 

      // TODO: Map raw files to meta rows and create a MetadataInformation and a raw file object for each mapping 
      if (saveUploadObjectsToDB(uploadSet)){
        res.send("Data Uploaded Successfully! Confirmation Email will be sent soon!");
        return;
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

// TODO: move to helper?
function extractSubmissionInfoFromReqBody(requestBody){
  let submissionInfo = {};

  // TODO: Extract All parameters 
  submissionInfo.name = requestBody.fname + " " + requestBody.lname;
  submissionInfo.email = requestBody.email;
  submissionInfo.dataFrom = requestBody.dataFrom;

  return submissionInfo; 
}