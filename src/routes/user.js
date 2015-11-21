'use strict';

var express = require('express');
var path = require('path');
var passwordless = require('passwordless');
var router = express.Router();
var request = require('request');

var User = require('../models/user');

// Redirects to Sign In page currently, unless you are already authenticated,
// in which case you are simply redirected to the home page.
router.get('/', function(req, res) {
  if (req.auth) {
    res.redirect('/');
  } else {
    res.redirect('/user/signin');
  }
});

// Sign in to the website.
router.get('/signin', function(req, res) {
  res.render('user/signin', {
    error: req.flash('passwordless')[0]
  });
});

// Sign out of the website.
router.get('/signout', passwordless.logout(), function(req, res) {
  res.redirect('/');
});

// Authenticate a user.
router.post('/authenticate', passwordless.requestToken(
  function(user, delivery, callback, req) {
    var name = req.body.name.trim();
    var email = req.body.email.trim().toLowerCase();

    var query = User.findOne({
      name: name,
      email: email
    });

    query.exec(function(err, user) {
      if (user) {
        callback(null, user.id);
      } else {
        callback(err, null);
      }
    });
  },{
    userField: 'email',
    failureRedirect: '/user/signin',
    failureFlash: 'Authentication error.'
  }), function(req, res) {
    // Successful authentication.
    res.redirect('/user/sent');
  }
);

// Tell user that token was sent after successful sign in.
router.get('/sent', function(req, res) {
  res.render('user/sent');
});

// Tell the user that they are successfully authenticated.
router.get('/authenticated', function(req, res) {

  // Update the lastAccessed field of this User to the current time.
  User.update({_id: res.locals.user._id}, {
    lastAccessed: new Date()
  }, {upsert: true}, function(err) {
    if (err) {
      next(err);
    } else {
      console.log('User authenticated.');
    }
  });
  res.render('user/authenticated');
});

module.exports = router;
