var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const fileUpload = require('./lib/index');
const bodyParser = require('body-parser');
const request = require('request');

const models = require('./models');

var indexRouter = require('./routes/index');
var uploadRouter = require('./routes/upload');
var searchRouter = require('./routes/search');
var usersRouter = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use('/api/jokes', require('./crud')(models.Jokes));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'downloads')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/upload', uploadRouter);
app.use('/search', searchRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {errordetails: err});
});

module.exports = app;

// Initial Config
const port = process.env.PORT || 3331;

// Server
app.listen(port, () => console.log(`Listening on port ${port}`));
