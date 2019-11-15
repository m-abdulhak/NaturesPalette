var express = require('express');
const path = require('path');

const fs = require('fs');
const app = express();

const reflectance_museum_header_fields = [
  "filename",
  "institutioncode",
  "cataloguenumber",
  "genus",
  "specificepithet",
  "patch",
  "lightangle1",
  "lightangle2",
  "probeangle1",
  "probeangle2",
  "replicate"
  ];

const reflectance_field_header_fields = [
  "filename",
  "uniqueid",
  "genus",
  "specificepithet",
  "patch",
  "lightangle1",
  "lightangle2",
  "probeangle1",
  "probeangle2",
  "replicate"
  ];


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
  
  // TODO: All Other 'online' request-related verifications 

  return true;
}

exports.verifyMetaFileHeaderFields = function (metaFileType,metaFileUrl,err) {
  err.details = "";
    
  // verify if each column is existing
  var metaFileHeaderFields = [];
  var fileContents = fs.readFileSync(metaFileUrl);
  var lines = fileContents.toString().split('\n');
  
  metaFileHeaderFields = lines[0].toString().split(',').map(element => {
    return element.toLowerCase().trim();
  });

  reference_header_fields = metaFileType.toLowerCase() == "field"? reflectance_field_header_fields : reflectance_museum_header_fields;

  missingColumn = [];
  
  for(var i =0;i<reference_header_fields.length;i++){
    // check = meta_file_obj_arr[i].replace(/\s/g, "");
    if(!metaFileHeaderFields.includes(reference_header_fields[i])){
      missingColumn.push(reference_header_fields[i]);
    }
  }
  
  if(missingColumn.length > 0){
    err.details = "Meta File Header is missing the following fields: " + missingColumn.join();
  return false;
  }
  
  return true;
}