'use strict';

var express = require('express');
var passwordless = require('passwordless');
var router = express.Router();

var Article = require('../models/article');

// Admin landing page.
router.get('/', function(req, res) {
  res.render('admin/index');
});

// Blog editing tools.
router.get('/blog', function(req, res) {
  res.render('admin/blog');
});

// Create new blog page.
router.get('/blog/create', function(req, res) {
  res.render('admin/blog/create');
});

// Select an article to view and edit.
router.post('/blog/view', function(req, res) {
  res.redirect('/admin/blog/view/' + req.body.link);
});

// Save a newly created article.
router.post('/blog/create/save', function(req, res, next) {

  // Check if an article with the same link already exists.
  var query = Article.findOne({link: req.params.link});
  query.exec(function(err, article) {
    if (article) {
      next(new Error('Article already exists!'));
    }
  });

  // Create a new article.
  var article = new Article({
    date_posted: new Date(),
    title:       req.body.title,
    flavour:     req.body.flavour,
    description: req.body.description,
    body:        req.body.body,
    link:        req.body.link,
    scripts:     req.body.scripts.trim().split('\n'),
    styles:      req.body.styles.trim().split('\n')
  });
  article.save(function(err) {
    if (err) {
       next(err);
    }
  });
  res.redirect('/admin/blog');
});

// TODO Save article as a draft (incomplete fields, not displayed on website)
router.post('/blog/draft', function(req, res) {
  console.log('This is where a blog post would be saved as a draft.');
  res.redirect('/admin/blog');
});

// Saves the updated version of the article.
router.post('/blog/update', function(req, res) {
  Article.update({link: req.body.link}, {
    title:       req.body.title,
    flavour:     req.body.flavour,
    description: req.body.description,
    body:        req.body.body,
    link:        req.body.link,
    scripts:     req.body.scripts.split('\n'),
    styles:      req.body.styles.split('\n'),
  }, function(err) {
    if (err) {
      next(err);
    } else {
      console.log('Article updated.');
    }
  });
  res.redirect('/admin/blog/view/' + req.body.link);
});

// Displays an existing article for viewing and editing.
router.get('/blog/view/:link', function(req, res, next) {
  var query = Article.findOne({link: req.params.link});
  query.exec(function(err, article) {
    if (article === null || article === undefined) {
      var err = new Error('Not found');
      err.status = 404;
      next(err);
    } else {
      res.render('admin/blog/view', {
        article: article,
        scripts: article.formatScripts(),
        styles: article.formatStyles()
      });
    }
  });
});

module.exports = router;
