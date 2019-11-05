// File: ./models/somemodel.js

//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;


var MetaDataSchema = new Schema({
    fileName: String,
    fileUrl: String,
    uploaded: { type: Date, default: Date.now() }
  },
  { strict: false }
);

//Export function to create "SomeModel" model class
module.exports = mongoose.model('MetaData', MetaDataSchema );