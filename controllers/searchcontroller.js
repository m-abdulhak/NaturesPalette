var express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');
const moment = require('moment');
var mongoose = require('mongoose');

var SubmissionModel = require('../models/SubmissionModel');
var SubmissionInfoModel = require('../models/SubmissionInfoModel');
var MetaDataFileModel = require('../models/MetaDataFileModel');
var MetaDataInformationModel = require('../models/MetaDataInformationModel');
var RawFileModel = require('../models/RawFileModel');

// get search page
exports.getSearch = function(req, res) {
  MetaDataInformationModel.find({}, function(err, metaDatas){
      if(err){
        console.log("Error retrieving meta data information from DB: " + err);
      } else{
          res.render('search', {searchResult: metaDatas, error: null});
          console.log('retrieved meta data information', metaDatas);
          return;
      }
  });
};

// get search result 
exports.postSearch = function(req, res, next) {
  res.render('search', {searchResult: "Found!", error: null});

};
