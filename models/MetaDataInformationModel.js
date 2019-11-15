// File: ./models/somemodel.js

//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;


var MetaDataInformationSchema = new Schema({
  metaDataCollectionId: Number,
  recordId: String,
  rawFileId: String,

  // reflectance field and museum template required fields
  genus: String,
  specificEpithet: String,
  Patch: String,
  LightAngle1: String,
  LightAngle2: String,
  ProbeAngle1: String,
  ProbeAngle2: String,
  Replicate: String,

  // reflectance field template required fields
  UniqueID: String,

  // reflectance museum template required fields
  institutionCode: Number,
  catalogueNumber: Number,

  // other fields
  collectionCode: Number,
  field: Number,
  class: String,
  order: String,
  family: String,
  infraSpecificEpithet: String,
  sex: String,
  lifeStage: String,

  timestamp: { type: Date, default: Date.now() }
  },
  { strict: false }
);

//Export function to create "SomeModel" model class
module.exports = mongoose.model('MetaDataInfo', MetaDataInformationSchema );
