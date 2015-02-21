var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// mongodb dependencies.
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(process.env.CUSTOMCONNSTR_MONGOLAB_URI);

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make db accessible to router.
app.use(function(req, res, next) {
    req.db = db;
    next();
});

app.use('/', routes);

// Catch 404 error and forward it to the error handler.
app.use(function(req, res, next) {
    console.log('Catching 404 error');
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handler. Provides a custom page for 404 errors.
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log('called error handler.');
    if (err.status == 404) {
        res.render('error', {
            status: '404',
            message: 'Page not found',
            description: "The page you were looking for isn't here! You can try heading back to the <a class='inline' href='/'>homepage</a>."
        });
    } else {
        res.render('error', {
            status: err.status,
            message: err.message,
            description: 'It looks like something went wrong.'
        });
    }
});


module.exports = app;
