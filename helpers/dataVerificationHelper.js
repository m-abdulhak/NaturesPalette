var express = require('express');
const path = require('path');

const fs = require('fs');
const app = express();

meta_file_obj_arr = ["InstitutionCode",
"CollectionCode",
"CatalogNumber",
"Genus",
"SpecificEpithet",
"InfraspecificEpithet",
"Sex",
"Country",
"Part",
"Replicate",
"File name"
]


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
  
  // verify if each column is existing
  var array = [];
  var fileContents = fs.readFileSync('./uploads/'+req.files.metaFile.name);
  var lines = fileContents.toString().split('\n');
  string = lines[0].toString();
  array = string.split(',');
  missingColumn = []
for(var i =0;i<meta_file_obj_arr.length;i++)
// check = meta_file_obj_arr[i].replace(/\s/g, "");
  if(!array.includes(meta_file_obj_arr[i])){
    missingColumn.push(meta_file_obj_arr[i]);
  }
  
  if(missingColumn.length > 0){
  err.details = "Sorry, the following fields are missing: "+missingColumn.join();
  return false;
  }

  // TODO: All Other 'online' request-related verifications 

  return true;
}