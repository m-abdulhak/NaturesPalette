var express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');
const moment = require('moment');
var mongoose = require('mongoose');

const uuidv1 = require('uuid/v1');
var zipHelper = require('../helpers/zipHelper');

var SubmissionModel = require('../models/SubmissionModel');
var SubmissionInfoModel = require('../models/SubmissionInfoModel');
var MetaDataFileModel = require('../models/MetaDataFileModel');
var MetaDataInformationModel = require('../models/MetaDataInformationModel');
var RawFileModel = require('../models/RawFileModel');

// get search page
exports.getSearch = function(req, res) {
  res.render('search', {searchResult: null, error: null});
};

// get search result 
exports.postSearch = function(req, res, next) {
  //console.log(req.body);
  var query = extractSearchQueryFromReq(req.body);
  var columns = '_id rawFileId genus specificepithet infraspecificepithet sex lifestage patch url';
  //console.log(query);
  MetaDataInformationModel.find(query, columns, async function(err, metaDatas){
    if(err){
      console.log("Error retrieving meta data information from DB: " + err);
    } else{
        var results = [];
        for(var metaData of metaDatas){
          var result = {};
          result._id = metaData._id;
          result.rawFileId = metaData.rawFileId;
          result.genus = metaData.genus;
          result.specificepithet = metaData.specificepithet;
          result.infraspecificepithet = metaData.infraspecificepithet;
          result.sex = metaData.sex;
          result.lifestage = metaData.lifestage;
          result.patch = metaData.patch;
          var rFile = await RawFileModel.findById(metaData.rawFileId);
          result.url = path.resolve(path.normalize(rFile.path));

          results.push(result);
        }
        var ret = JSON.stringify(results);
        res.render('search', {searchResult: results, error: null});
        //console.log('retrieved meta data information', ret);
        return;
    }
  });
};

const searchTerms = ["institutioncode",
"collectioncode",
"cataloguenumber",
"class",
"order",
"family",
"genus",
"infraSpecificepithet",
"specificepithet",
"sex",
"lifestage",
"country",
"patch"];

function extractSearchQueryFromReq(reqBody) {
  var query = {};
  for(var term of searchTerms){
    var termVal = getSearchTermsFor(reqBody,term);
    if(termVal!=null){
      var termValsList = termVal.trim().split(' OR ').map(element => {
        //return '/'+element.toLowerCase().trim()+'/i';
        return new RegExp('\\b' + element.toLowerCase().trim() + '\\b', 'i');
      });
      query[term] = { $in : termValsList };
    }
  }
  return query;
}

function getSearchTermsFor(reqBody,field){
  return reqBody[field] == null || reqBody[field] == "" ? null : reqBody[field];
}


// DOWNLOAD

exports.downloadResults = function(req, res, next) {
  //console.log(req.body);
  var rand = uuidv1();
  var metaDataIdsList = JSON.parse(req.body.ids);
  
  MetaDataInformationModel.find({ _id: { $in : metaDataIdsList }}, async function(err, metaDatas){
    if(err){
      console.log("Error retrieving meta data information from DB: " + err);
    } else{

      // create lists of allIds of raw files and submission infos corresponding to requested meta data file
      var rawFileUrls = [];
      var submissionInfoIds = [];
      var submissionInfos = [];

      for(var metaData of metaDatas){
        // get raw file corresponding to this data row
        var rFile = await RawFileModel.findById(metaData.rawFileId);
        rawFileUrls.push(path.resolve(path.normalize(rFile.path)));
        
        // get submission corrsponding to this data row
        var submission = await SubmissionModel.findById(rFile.submissionId);
        metaData.submissionInfoId = submission.submissionInfoId;
        if (submissionInfoIds.indexOf(submission.submissionInfoId) === -1) {
          submissionInfoIds.push(submission.submissionInfoId);

          var submissionInfo = await SubmissionInfoModel.findById(submission.submissionInfoId);
          submissionInfos.push(submissionInfo); 
        }
      }
      
      // submission info data file location
      var submissionInfoFileLocation = 'downloads/submissionInfo' + '-' + rand + '.csv';
        
      // TODO: generate submission info file content (json to csv)
      var submissionInfoFileContent = generateSubmissionInfoFileContent(submissionInfos); 

      // TODO: write submission info content to file
      fs.writeFileSync(submissionInfoFileLocation, submissionInfoFileContent);

      // meta data file location
      var metaFileLocation = 'downloads/metaData' + '-' + rand + '.csv';

      // generate meta data file content (json to csv)
      var metaDataFileContent = generateMetaFileContent(metaDatas); 

      // write meta data to meta data file
      fs.writeFile(metaFileLocation, metaDataFileContent, 'utf8', function (err) {
        if (err) {
          console.log('Some error occured - file either not saved or corrupted file saved.');
        } else{
          console.log('Meta Data file saved!');

          // add submission info file to files list 
          rawFileUrls.push(submissionInfoFileLocation);

          // add meta data file to files list 
          rawFileUrls.push(metaFileLocation);

          //Zip all raw files with meta data file and submission info file
          var zipFile = zipHelper.zip(rawFileUrls);  

          //send file to user
          res.set('Content-Type','application/octet-stream');
          var stat = fs.statSync(zipFile);
          res.setHeader('Content-Disposition', 'attachment; filename='+path.resolve(path.normalize(zipFile)));
          res.setHeader("Content-Length",stat.size);
          res.download(path.resolve(path.normalize(zipFile)), function (err) {
            if (err) {
              // Handle error, but keep in mind the response may be partially-sent
              // so check res.headersSent
              console.log("download error " + err);
            } else {
              // decrement a download credit, etc.
            }
          });
        }
      });      
    }
  });
};

// TODO: Implement 
function generateSubmissionInfoFileContent(submissionInfos) {
  return submissionInfos;
}

// TODO: Implement 
function generateMetaFileContent(metaData) {
  return metaData;
}

// WHAT IS THIS??!!
function generateMetaFile(metaDataIdsList) {
  var metaFile = generateMetaFile(metaDataIdsList);
  var rawFilesUrls = getRawFilesUrls(metaDataIdsList);
  var zipFile = zipFiles(metaFile,rawFilesUrls);  
  res.download(zipFile);
  var metaDataInformations = MetaDataInformationModel.find(metaDataIdsList, function (err, docs) { });
  return metaDataInformations;
}
