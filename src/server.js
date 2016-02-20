'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var mongoose = require('mongoose');

var auth = require('./lib/auth');
var router = require('./lib/router');
var error = require('./lib/error');

// Connect to MongoDB database.
mongoose.connect(process.env.MONGO_URI);

var app = express();

// View engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Other middleware.
app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(flash());

// Logic.
auth.init(app);
router.route(app);
error.handle(app);
app.listen(process.env.PORT);

module.exports = app;
