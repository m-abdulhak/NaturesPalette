// File: ./models/somemodel.js

//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var SubmissionInfoModelSchema = new Schema({
  id: String,
  recordId: Number,
  name: String, 
  email: String,
  isDataPublished: Boolean,
  researchId: Number,
  metaDataCollectionId: Number,
  typeOfData: String,
  dataForm: String,
  published: Boolean,
  reference: String,
  embargo: Boolean,
  releaseDate: { type: Date, default: Date.now() },
  doi:String
  },
  { strict: false }
);

//Export function to create "SomeModel" model class
module.exports = mongoose.model('SubmissionInfo', SubmissionInfoModelSchema );
