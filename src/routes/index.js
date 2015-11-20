'use strict';

var express = require('express');
var router = express.Router();

var Article = require('../models/article');

router.get('/', function(req, res) {
  var query = Article.find().sort({date_posted: -1}).limit(3);
  query.exec(function(err, articles) {
    res.render('index', { articles: articles });
  });
});

router.get('/projects', function(req, res) {
  res.render('projects');
});

router.get('/about', function(req, res) {
  res.render('about');
});

router.get('/pgp', function(req, res) {
  res.render('pgp');
});

router.get('/tools', function(req, res) {
  res.render('tools');
});

module.exports = router;
