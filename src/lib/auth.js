'use strict';

var passwordless = require('passwordless');
var session = require('express-session');
var MongoStore = require('passwordless-mongostore-bcrypt-node');
var MongoSessionStore = require('connect-mongo')(session);

var smtpServer = require('./smtp').server;
var User = require('../models/user');

// Initialize authentication, which sets up user sign in and sessions.
exports.init = function(app) {
  passwordless.init(new MongoStore(process.env.MONGO_URI));
  passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
      User.findById(uidToSend, function(err, user) {
        smtpServer.send({
          text: 'Hi ' +  user.name + '!'
              + '\n\n'
              + 'Access your account here: '
              + (process.env.NODE_ENV === 'production' ? 'https://' : '')
              + process.env.HOST + '?token=' + tokenToSend + '&uid='
              + encodeURIComponent(uidToSend)
              + '\n\n'
              + 'This token expires in 10 minutes and can only be used once.'
              + '\n\n'
              + 'Cheers!',
          from: 'Authentication Token <' + process.env.AUTH_EMAIL_USER + '>',
          to: recipient,
          subject: 'Token from ' + process.env.HOST
      }, function (err, message) {
        if (err) {
          console.log(err);
        }
        callback(err);
      });
    });
  }, { ttl: 1000 * 60 * 10 });

  // Support for user sessions.
  app.use(session({
    store: new MongoSessionStore({
      url: process.env.MONGO_URI
    }),
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true
  }));

  // Intercept the UUID.
  app.use(passwordless.sessionSupport());
  app.use(passwordless.acceptToken({successRedirect: '/user/authenticated'}));

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
};
