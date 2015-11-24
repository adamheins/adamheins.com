'use strict';

var express = require('express');
var path = require('path');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('projects');
});

router.get('/:name', function(req, res) {
  // For a project to get rendered correctly, it must have a file called
  // 'index.html' in the project root.
  var projectName = req.params.name;
  var projectPath = path.join(__dirname, '../public/projects', projectName);
  res.sendfile(path.join(projectPath, 'index.html'));
});

module.exports = router;
