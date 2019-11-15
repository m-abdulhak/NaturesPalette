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

  var reference_header_fields = getReferenceHeaderFields(metaFileType);

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

exports.verifyAndGetMetaDataRows = function (metaFileUrl,metaFileType,err) {
  err.details = "";

  var fileContents = fs.readFileSync(metaFileUrl);
  var lines = fileContents.toString().split('\n').filter(x=>x!=null&&x!="");
  if(lines.length<1){
    err.details = "Meta File Error, file has no contents!";
    return false;
  }
  var headers = lines[0].toString().split(',');

  if(lines.length<2){
    err.details = "Meta File Error, file has no contents other than header!";
    return false;
  }
  
  var fileNameColIndex = getRawFileNameColumnIndex(lines[0]);
  var requiredFieldsIndices = getRequiredFieldsColumnsIndices(lines[0],metaFileType);

  metaDataRows = [];
  rawFileNames = [];
  
  for(var i =1;i<lines.length;i++){
    var values = lines[i].toString().split(',');

    // make sure all required field are present
    for (const requiredFieldIndex in requiredFieldsIndices) {
      var requiredFieldValue = values[requiredFieldIndex].trim();
      if( requiredFieldValue == null || requiredFieldValue == "" ){
        err.details = "Meta File Error, Invalid value '" + requiredFieldValue.toString() + "' found for required fieled '" + headers[requiredFieldIndex] + "' specified in line : " + i;
        return false;
      }
    }
    
    // extract values of this row into an object
    var metaDataRow = {};
    headers.forEach(function(element,index) {
      metaDataRow[element.toLowerCase().trim()]  = values[index];      
    });

    // add this row to list of rows 
    metaDataRows.push(metaDataRow);

    // add filename of this row into file names list  
    var fileName = values[fileNameColIndex].trim();
    rawFileNames.push(fileName);
  }
    
  if(arrayHasDuplication(rawFileNames, err)){
    err.details = "Meta File Error, raw file name duplication: " + err.details;
    return false;
  }
  return metaDataRows;
}

getRequiredFieldsColumnsIndices = function (metaFileHeaderLine,metaFileType) {
  metaFileHeaderFields = metaFileHeaderLine.toString().split(',').map(element => {
    return element.toLowerCase().trim();
  });

  reference_header_fields = getReferenceHeaderFields(metaFileType);

  requiredHeaderFieldIndices = [];
  for (const headerField in reference_header_fields) {
    requiredHeaderFieldIndices.push(metaFileHeaderFields.findIndex(x=>x==headerField));
  }

  return requiredHeaderFieldIndices;
}


getRawFileNameColumnIndex = function (metaFileHeaderLine) {
  
  metaFileHeaderFields = metaFileHeaderLine.toString().split(',').map(element => {
    return element.toLowerCase().trim();
  });
  
  return metaFileHeaderFields.findIndex(x=>x=="filename");
}

arrayHasDuplication = function(array,err) {
  var alreadySeen = [];

  for (const str of array){
    if (alreadySeen.indexOf(str)>-1){
      err.details = str;  
      return true;
    }
    alreadySeen.push(str);
  }

  return false;
}

getReferenceHeaderFields = function (metaFileType) {  
  var reference_header_fields = metaFileType.toLowerCase() == "field"? reflectance_field_header_fields : reflectance_museum_header_fields;
  return reference_header_fields;
}