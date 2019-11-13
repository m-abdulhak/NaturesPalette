var express = require('express');
const path = require('path');

const fs = require('fs');
const app = express();

var AdmZip = require('adm-zip');

exports.getFileNamesInZip = function(fileUrl) {
  var zip = new AdmZip(fileUrl);
  
  var zipEntries = zip.getEntries().map(function(entry) {
  	return entry.entryName;
  });

  return zipEntries;
}

