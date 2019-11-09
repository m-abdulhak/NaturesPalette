// File: ./models/somemodel.js

//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var MetaDataFileSchema = new Schema({
    metaDataFileId: Number,
    path: String,
  	submissionId: String,
    name: String,
    creationTime: { type: Date, default: Date.now() }
  },
  { strict: false }
);

//Export function to create "SomeModel" model class
module.exports = mongoose.model('MetaDataFile', MetaDataFileSchema );
