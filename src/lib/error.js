'use strict';

let MESSAGE_404 = 'Page not found';
let DESC_404 = 'The page you were looking for isn\'t here! You can try heading '
             + 'back to the <a href="/">homepage</a>.';

let DESC_OTHER = 'It looks like something went wrong. You can try heading back '
               + 'to the <a href="/">homepage</a>.';

// Handle http errors.
exports.handle = function(app) {

  // Generic handler. If the app gets this far without sending a response,
  // assume something has gone wrong and generate a 404.
  app.use((req, res, next) => {
    console.log('Generating 404 error');

    let err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // Error handler. Provides a custom page for 404 errors.
  app.use((err, req, res, next) => {
    console.log('Called error handler.');
    console.log(err);

    // Errors with no status codes automatically become 404 errors.
    if (!err.status) {
        err.status = 404;
    }

    if (err.status === 404) {
      res.render('error', {
        status: err.status,
        message: MESSAGE_404,
        description: DESC_404
      });
    } else {
      res.render('error', {
        status: err.status,
        message: err.message,
        description: DESC_OTHER
      });
    }
  });
};
