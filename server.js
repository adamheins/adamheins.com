var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

// Authentication dependencies.
var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore-bcrypt-node');
var email = require('emailjs');
var session = require('express-session');

// MongoDB setup.
var mongoose = require('mongoose');
mongoose.connect(process.env.CUSTOMCONNSTR_MONGOLAB_URI);
var User = require('./models/user');

// Set up an email server to deliver password tokens.
var smtpServer = email.server.connect({
  user: process.env.AUTH_EMAIL_ADDRESS,
  password: process.env.AUTH_EMAIL_PASSWORD,
  host: 'smtp.gmail.com',
  ssl: true
});

var host = 'adamheins.com';

// Set up authentication.
passwordless.init(new MongoStore(process.env.CUSTOMCONNSTR_MONGOLAB_URI));
passwordless.addDelivery(
  function(tokenToSend, uidToSend, recipient, callback) {
    User.findById(uidToSend, function(err, user) {
      smtpServer.send({
        text: 'Hi ' +  user.name + '!\n\nAccess your account here:\nhttps://'
        + host + '?token=' + tokenToSend + '&uid='
        + encodeURIComponent(uidToSend) + '\n\nThis token expires in 10 minutes '
        + 'and can only be used once.\n\nCheers!',
        from: 'Authentication Token <password@adamheins.com>',
        to: recipient,
        subject: 'Token for ' + host
    }, function (err, message) {
      if (err) {
        console.log(err);
      }
      callback(err);
    });
  });
}, { ttl: 1000 * 60 * 10 });

var tokenMaxAge = 1000 * 60 * 60 * 24;

var routes = require('./routes/index');
var user = require('./routes/user');
var admin = require('./routes/admin');

var app = express();

// View engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Other middleware.
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: tokenMaxAge },
  saveUninitialized: true,
  resave: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// Intercept the UUID.
app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken({ successRedirect: '/user/authenticated' }));

// Make authenticated user ID available to router.
app.use(function(req, res, next) {
  User.findById(req.user, function (err, user) {
    res.locals.user = user;
    if (user) {
      res.locals.isAdmin = user.isAdmin();
    }
    next();
  });
});

app.use('/', routes);
app.use('/user', user);
app.use('/admin', passwordless.restricted({ failureRedirect: '/user/signin' }),
  function(req, res, next) {
    if (res.locals.user.isAdmin()) {
      next();
    } else {
      res.redirect('/');
    }
  }
);
app.use('/admin', admin);


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
  console.log('Called error handler.');
  if (err.status == 404) {
    res.render('error', {
      status: '404',
      message: 'Page not found',
      description: "The page you were looking for isn't here! You can "
                 + "try heading back to the <a class='inline' "
                 + "href='/'>homepage</a>."
    });
  } else {
    res.render('error', {
      status: err.status,
      message: err.message,
      description: "It looks like something went wrong. You can try "
                 + "heading back to the <a class='inline' "
                 + "href='/'>homepage</a>."
    });
  }
});

module.exports = app;
