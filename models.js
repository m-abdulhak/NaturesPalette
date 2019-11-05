//models.js
const mongoose = require('mongoose');

// ===============
// Database Config
// ===============
mongoose.connect('mongodb://localhost:27017/NPS', {useNewUrlParser: true});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// =======
// Schemas
// =======
// var Schema = mongoose.Schema;

//var models = {};

//module.exports = models;