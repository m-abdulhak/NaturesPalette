var express = require('express');
const path = require('path');

const fs = require('fs');
const app = express();

const uuidv1 = require('uuid/v1');
 
var AdmZip = require('adm-zip');

const rawFilesLocation = path.dirname(__dirname) + '/uploads/raw/';

exports.getFileNamesInZip = function(fileUrl) {
  var zip = new AdmZip(fileUrl);
  
  var zipEntries = zip.getEntries().map(function(entry) {
  	return entry.entryName;
  });

  return zipEntries;
}

exports.unzip = function(fileUrl){
  	var zip = new AdmZip(fileUrl);
  	var rand = uuidv1();
  	//console.log(rand);
  	var folder = rawFilesLocation + path.basename(fileUrl) + '-' + rand + '/';
  	//console.log(folder);
	zip.extractAllTo(folder, true);

	return get_files(folder);
}

// get all filse within folder (for testing only)
get_files = function(folder) {
  let filenames = [];

  fs.readdirSync(folder).forEach(file => {
    filenames.push(file);
  });

  return filenames;
}