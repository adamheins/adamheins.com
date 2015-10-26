'use strict';

var express = require('express');
var router = express.Router();

var Article = require('../models/article');

// Home page.
router.get('/', function(req, res) {
  var query = Article.find().sort({date_posted: -1}).limit(3);
  query.exec(function(err, articles) {
    res.render('index', { articles: articles });
  });
});

// Projects page.
router.get('/projects', function(req, res) {
  res.render('projects');
});

// About page.
router.get('/about', function(req, res) {
  res.render('about');
});

// pgp page.
router.get('/pgp', function(req, res) {
  res.render('pgp');
});

module.exports = router;
