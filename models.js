//models.js
const mongoose = require('mongoose');

// ===============
// Database Config
// ===============
//mongoose.connect('mongodb://localhost:27017/NPS', {useNewUrlParser: true});
mongoose.connect('mongodb+srv://NPSUser:NPSPass@npscluster-lqmsa.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});
//mongoose.connect('mongodb+srv://naturepalette:naturepalette@cluster0-bps0e.mongodb.net/NPS?retryWrites=true&w=majority', {useNewUrlParser: true});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// =======
// Schemas
// =======
// var Schema = mongoose.Schema;

//var models = {};

//module.exports = models;