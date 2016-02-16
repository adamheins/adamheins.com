'use strict';

var express = require('express');
var router = express.Router();

// Resume landing page.
router.get('/', function(req, res) {
  res.redirect(process.env.STATIC_HOST + '/resume/resume.pdf');
});

module.exports = router;
