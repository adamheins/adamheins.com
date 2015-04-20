var express = require('express');
var path = require('path');
var passwordless = require('passwordless');
var router = express.Router();
var request = require('request');

var User = require('../models/user');

/* Redirects to Sign In page currently, unless you are already authenticated. */
router.get('/', function(req, res) {
  if (req.auth) {
    res.redirect('/');
  } else {
    res.redirect('/user/signin');
  }
});

router.get('/signin', function(req, res) {
  console.log(res.locals.user);
  res.render('user/signin', {
    error: req.flash('error')[0],
    name: req.flash('name')[0],
    email: req.flash('email')[0]
  });
});

router.get('/signout', passwordless.logout(), function(req, res) {
  res.redirect('/');
});

function signinFlash(req, name, email, field, message) {
  console.log(message);
  req.flash('error', {
    field: field,
    message: message
  });
  req.flash('name', name);
  req.flash('email', email);
}

/* Checks to see if an entire string is matched be a regex pattern. */
function matchWhole(str, pattern) {
  var match = pattern.exec(str);
  if (match === null)
    return false;
  return match[0].length === str.length;
}

/* Post to create a new user. */
router.post('/authenticate', function(req, res, next) {

  var screenName = req.body.name.trim();
  var userEmail = req.body.email.trim().toLowerCase();

  // Validate the user email.
  if (!matchWhole(userEmail, /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/)
      || userEmail.length > 32) {
    signinFlash(req, screenName, userEmail, 1, "The email provided is not valid.");
    res.redirect('/user/signin');
    return;
  }

  // Validate the user name.
  if (!matchWhole(screenName, /\b[a-z0-9._-]+\b/i) || screenName.length > 20) {
    signinFlash(req, screenName, userEmail, 0, "The name provided is not valid.");
    res.redirect('/user/signin');
    return;
  }

  var nameQuery = User.findOne({name: screenName});
  nameQuery.exec(function(err, user) {
    if (err) {
      next(err);
    } else if (user) {
      // Check if the user already exists. If so, we can skip right to authentication.
      if (user.email === userEmail) {
        next();
      } else {
        signinFlash(req, screenName, userEmail, 0, "The name provided is already in use.");
        res.redirect('/user/signin');
      }
    } else {
      var emailQuery = User.findOne({email: userEmail});
      emailQuery.exec(function(err, email) {
        if (err) {
          next(err);
        } else if (email) {
          signinFlash(req, screenName, userEmail, 1, "The email provided is already in use.");
          res.redirect('/user/signin');
        } else {
          // Create the new user. Until the user has authenticated, the lastAccessed field
          // will remain null.
          var newUser = new User({
            name: screenName,
            email: userEmail,
            privilege: 'DEFAULT',
            lastAccessed: null
          });
          newUser.save(function(err, user) {
            if (err) {
              console.log('Error creating user.');
            }
            next();
          });
        }
      });
    }
  });
}, passwordless.requestToken(
  function(user, delivery, callback, req) {
    console.log(req.body);
    var query = User.findOne({
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase()
    });
    query.exec(function(err, user) {
      if (err) {
        console.log('An error occurred adding the user.');
      } else if (user === null || user === undefined) {
        callback(null, null);
      } else {
        callback(null, user.id);
      }
    });
  },{
    userField: 'email',
    failureRedirect: '/'
  }), function (req, res) {
    res.redirect('/user/sent');
  }
);

/* Route telling user that token was sent. */
router.get('/sent', function(req, res) {
  res.render('user/sent');
});

/* Route telling user that they are authenticated. */
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