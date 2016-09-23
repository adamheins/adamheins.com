'use strict';

let express = require('express');
let path = require('path');
let mongoose = require('mongoose');

let router = require('./lib/router');
let error = require('./lib/error');

// Connect to MongoDB database.
mongoose.connect(process.env.MONGO_URI);

let app = express();

// View engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Logic.
router.route(app);
error.handle(app);

app.listen(process.env.PORT);

module.exports = app;
