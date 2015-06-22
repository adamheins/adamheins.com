'use strict';

// Redirect to https if the connection is not already secure.
exports.redirect = function(app) {
  if (process.env.NODE_ENV === 'production') {
    app.use(function(req, res, next) {
      if (!req.secure) {
        return res.redirect('https://' + process.env.HOST + req.url);
      }
      next();
    });
  }
};

// Set up https to connect securely.
exports.listen = function(app) {
  if (process.env.NODE_ENV === 'production') {
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
};
