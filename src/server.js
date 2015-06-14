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
var MongoSessionStore = require('connect-mongo')(session);

// MongoDB setup.
var mongoPath = process.env.MONGO_URI;
var mongoose = require('mongoose');
mongoose.connect(mongoPath);
var User = require('./models/user');

// Set up an email server to deliver password tokens.
var smtpServer = email.server.connect({
  user: process.env.AUTH_EMAIL_USER,
  password: process.env.AUTH_EMAIL_PASS,
  host: process.env.AUTH_EMAIL_SMTP,
  ssl: true
});

var host = 'adamheins.com';

// Set up authentication.
passwordless.init(new MongoStore(mongoPath));
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
app.use(flash());

// Make things in the public folder accessible.
app.use(express.static(path.join(__dirname, 'public')));

// Support for user sessions.
app.use(session({
  store: new MongoSessionStore({
    url: mongoPath
  }),
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: true
}));

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

// Redirect to https if the connection is not already secure.
if (process.env.NODE_ENV === 'production') {
  app.use(function(req, res, next) {
    if (!req.secure) {
      return res.redirect('https://adamheins.com' + req.url);
    }
    next();
  });
}

// Set up routes.
var routes = require('./routes/index');
var user = require('./routes/user');
var admin = require('./routes/admin');
var blog = require('./routes/blog');
var resume = require('./routes/resume');

app.use('/', routes);
app.use('/user', user);
app.use('/blog', blog);
app.use('/resume', resume);

// Restrict access to admin section of the website.
app.use('/admin', passwordless.restricted({ failureRedirect: '/user/signin' }),
  function(req, res, next) {
    if (res.locals.user.isAdmin()) {
      next();
    } else {
      res.redirect('/');
    }
  }
);
app.use('/admin', admin); // TODO is this required?

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

if (process.env.NODE_ENV === 'production') {
  // Set up https to connect securely.
  var https = require('https');
  var fs = require('fs');
  var options = {
    pfx: fs.readFileSync(process.env.PFX_FILE),
    passphrase: process.env.PFX_PASS
  };
  https.createServer(options, app).listen(3000);

  // Listen for http requests.
  app.listen(8080);
} else {
  app.listen(3000);
}

module.exports = app;
