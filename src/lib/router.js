'use strict';

// Set up routes for the site.
exports.route = function(app) {
  let routes = require('../routes/index');
  let blog = require('../routes/blog');
  let resume = require('../routes/resume');
  let projects = require('../routes/projects');
  let recipes = require('../routes/recipes');

  app.use('/', routes);
  app.use('/blog', blog);
  app.use('/resume', resume);
  app.use('/projects', projects);
  app.use('/recipes', recipes);
};
