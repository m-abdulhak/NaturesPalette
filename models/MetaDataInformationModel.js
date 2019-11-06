// File: ./models/somemodel.js

//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;


var MetaDataInformationSchema = new Schema({
  metaDataCollectionId: Number,
  recordId: String,
  field: Number,
  institutionCode: Number,
  collectionCode: Number,
  catalogueNumber: Number,
  class: String,
  order: String,
  family: String,
  genus: String,
  specificEpithet: String,
  infraSpecificEpithet: String,
  sex: String,
  lifeStage: String,
  timestamp: { type: Date, default: Date.now() }
  },
  { strict: false }
);

//Export function to create "SomeModel" model class
module.exports = mongoose.model('MetaDataInfo', MetaDataInformationSchema );
