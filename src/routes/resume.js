'use strict';

var express = require('express');
var path = require('path');
var router = express.Router();

// Resume landing page.
router.get('/', function(req, res) {
  res.redirect('/resume/resume.pdf');
});

// PDF version of my resume.
router.get('/resume.pdf', function(req, res) {
  res.sendfile(path.join(__dirname, '../public/res', 'resume.pdf'));
});

// JSON version of my resume.
router.get('/resume.json', function(req, res) {
  res.sendfile(path.join(__dirname, '../public/res', 'resume.json'));
});

module.exports = router;
