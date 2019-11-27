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
var MetaDataInformationModel = require('../models/MetaDataInformationModel');
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

  // set submissionInfo object from request paramters
  var subInfo = extractSubmissionInfoFromReqBody(req.body);


  // create all needed objects for the upload process
  let uploadSet = createUploadObjectsSet(subInfo);

  // upload meta file to server
  // TODO: metafile path not present in schema? extract and delete?
  uploadSet.metaFile.path = uploadHelper.uploadFileToServer(req.files.metaFile, function(err) {
    if (err){
      console.log("Error with meta file upload!"); 
      res.status(403).send("No files were uploaded! Error Occured: " + err.details);
      return;
    }

    // Do meta file header validations here
    var metaFieldsError = {};
    if (!verifyHelper.verifyMetaFileHeaderFields(uploadSet.submissionInfo.dataFrom,uploadSet.metaFile.path,metaFieldsError)){
      console.log("Error with meta file header!"); 
      res.status(403).send("No files were uploaded! Error Occured: " + metaFieldsError.details);
      return;
    }

    // Validate that all meta file rows contain All required values
    // verify that all required fields for this template exist in every row
    var metaDataRowsError = {};
    uploadSet.metaDetaInformations = verifyHelper.verifyAndGetMetaDataRows(uploadSet.metaFile.path,uploadSet.submissionInfo.dataFrom,metaDataRowsError);

    if(!uploadSet.metaDetaInformations){
      console.log("Error with meta files raw file names!"); 
      res.status(403).send("No files were uploaded! Error Occured: " + metaDataRowsError.details);
      return;
    }

    // upload raw file to server 
    uploadSet.rawFile.path = uploadHelper.uploadFileToServer(req.files.rawFile,function(err) {
      if (err){
        console.log("Error with raw file upload!"); 
        res.status(403).send("No files were uploaded! Error Occured: " + err.details);
        return;
      }
      
      // validate that raw files in zip file and the meta file rows match, 
      // use this function to get list of raw files in zip:
      // var rawFileNamesInZip = zipHelper.getFileNamesInZip(uploadSet.rawFile.path);
      //console.log(rawFileNamesInZip);

      var rawFilesInZip = zipHelper.unzip(uploadSet.rawFile.path);

      // extract all raw files from zip
      rawFilesInZip.forEach(function(zipEntry) {
        console.log(zipEntry);
      }); 

      if(rawFilesInZip.length!= uploadSet.metaDetaInformations.length){
        res.status(403).send("No files were uploaded! Error Occured: Number of Raw Files does not match number of rows in meta file!");
        return;
      }

      // Map raw files to meta rows and create a MetadataInformation and a raw file object for each mapping 
      for (const rawFile of rawFilesInZip) {
        var rawFileName = path.basename(rawFile);
        
        // get meta row from met file corresponding to this file
        var metaData = uploadSet.metaDetaInformations.find(obj => {
          return rawFileName.includes(obj.filename.trim());
        });

        if(metaData == undefined || metaData==null){
          res.status(403).send("No files were uploaded! Error Occured: Raw File " + rawFileName + " does not match any row in meta file!");
          return;
        }
        
        // create raw file object
        var rawF = {};
        rawF._id = mongoose.Types.ObjectId();
        rawF.submissionId = uploadSet.submission._id;
        rawF.name = rawFileName;
        // TODO: confirm with client that this is the meaning of type here
        rawF.type =  uploadSet.submissionInfo.typeOfData;
        rawF.path = rawFile;
        uploadSet.rawFiles.push(rawF);

        // set metadataobject rawFileId to created rawFileID
        metaData.rawFileId = rawF._id; 
        metaData.metaDataFileId = uploadSet.metaFile._id; 
      }

      // Save complete dataset to DB
      if (saveUploadObjectsToDB(uploadSet)){
        res.send("Data Uploaded Successfully! Confirmation Email will be sent soon!");
        return;
      }

      });
  });  
};

function createUploadObjectsSet(subInfo) {
  let uploadSet = {};
  // create submission object and set all ids 
  uploadSet.submission = {};
  uploadSet.submission._id = mongoose.Types.ObjectId();

  uploadSet.metaFile = {};
  uploadSet.metaFile._id = mongoose.Types.ObjectId();
  uploadSet.metaFile.submissionId =uploadSet.submission._id;

  uploadSet.metaDetaInformations = [];

  uploadSet.rawFile = {};
  uploadSet.rawFile._id = mongoose.Types.ObjectId();
  uploadSet.rawFile.submissionId =uploadSet.submission._id;

  uploadSet.rawFiles = [];

  uploadSet.submissionInfo = subInfo;
  uploadSet.submissionInfo._id = mongoose.Types.ObjectId();
  uploadSet.submissionInfo.submissionId =uploadSet.submission._id;

  // set all ids into submission  
  uploadSet.submission.submissionInfoId = uploadSet.submissionInfo._id;
  uploadSet.submission.rawFileId = uploadSet.rawFile._id;
  uploadSet.submission.metaDataFileId = uploadSet.metaFile._id;

  return uploadSet;
}

function saveUploadObjectsToDB(uploadSet) {
  //console.log(uploadSet);
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

  for (var i = uploadSet.rawFiles.length - 1; i >= 0; i--) {
    rawF = uploadSet.rawFiles[i];
    RawFileModel.create(rawF, function (err, rawFile_instance) {
      if (err){
        console.log("rawFile save ERROR! " + err);
        return false;
      }
    });
  }

  for (var i = uploadSet.metaDetaInformations.length - 1; i >= 0; i--) {
    metaDataRow = uploadSet.metaDetaInformations[i];
    MetaDataInformationModel.create(metaDataRow, function (err, metaDataInformation_instance) {
      if (err){
        console.log("metaDataRow save ERROR! " + err);
        return false;
      }
    });
  }

  return true;
}

// TODO: move to helper?
function extractSubmissionInfoFromReqBody(requestBody){
  let submissionInfo = {};

  // TODO: Extract All parameters 
  submissionInfo.name = requestBody.fname + " " + requestBody.lname;
  submissionInfo.email = requestBody.email;
  submissionInfo.institute = requestBody.institute;

  submissionInfo.typeOfData = requestBody.dataType;
  submissionInfo.dataFrom = requestBody.dataFrom;
  submissionInfo.published = requestBody.dataPublished;
  submissionInfo.reference = requestBody.reference;
  submissionInfo.doi = requestBody.doi;
  submissionInfo.embargo = requestBody.dataEmbargo;
  submissionInfo.releaseDate = requestBody.embargoDate;

  return submissionInfo; 
}