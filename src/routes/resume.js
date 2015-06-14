var express = require('express');
var path = require('path');
var router = express.Router();

// Resume landing page, which provides links to different formats.
router.get('/', function(req, res) {
  res.render('resume/index');
});

// PDF version of my resume.
router.get('/pdf', function(req, res) {
  res.sendfile(path.join(__dirname, '../public/resume', 'resume.pdf'));
});

// JSON version of my resume.
router.get('/json', function(req, res) {
  res.render('resume/json');
});

module.exports = router;
