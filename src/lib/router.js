'use strict';

var passwordless = require('passwordless');

// Set up routes for the site.
exports.route = function(app) {
  var routes = require('../routes/index');
  var user = require('../routes/user');
  var admin = require('../routes/admin');
  var blog = require('../routes/blog');
  var resume = require('../routes/resume');
  var projects = require('../routes/projects');
  var recipes = require('../routes/recipes');

  app.use('/', routes);
  app.use('/user', user);
  app.use('/blog', blog);
  app.use('/resume', resume);
  app.use('/projects', projects);
  app.use('/recipes', recipes);
  app.use('/admin', passwordless.restricted({failureRedirect: '/user/signin'}),
    function(req, res, next) {
      if (res.locals.user.isAdmin()) {
        next();
      } else {
        res.redirect('/');
      }
    }
  );
  app.use('/admin', admin);
};
