'use strict';

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var router = require('./lib/router');
var error = require('./lib/error');

// Connect to MongoDB database.
mongoose.connect(process.env.MONGO_URI);

var app = express();

// View engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Other middleware.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

// Logic.
router.route(app);
error.handle(app);
app.listen(process.env.PORT);

module.exports = app;
