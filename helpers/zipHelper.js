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
    filenames.push(path.resolve(path.normalize(folder+file)));
  });

  return filenames;
}


exports.zip = function(fileUrls){
    // creating archives
    var zip = new AdmZip();
    var rand = uuidv1();

    for(var file of fileUrls){
      // add local file
      zip.addLocalFile(file);      
    }
    //
    var willSendthis = zip.toBuffer();
    return willSendthis;
    // or write everything to disk
    //var zipFileUrl = 'downloads/researchData'+ rand + '.zip';
    //zip.writeZip(zipFileUrl);
    //return zipFileUrl;
}