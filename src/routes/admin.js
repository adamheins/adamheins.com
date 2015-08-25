'use strict';

var express = require('express');
var passwordless = require('passwordless');
var router = express.Router();

var Article = require('../models/article');
var Draft = require('../models/draft');

// Admin landing page.
router.get('/', function(req, res) {
  res.render('admin/index');
});

// Blog editing tools.
router.get('/blog', function(req, res) {
  res.render('admin/blog');
});

// Create new blog article.
router.get('/blog/create', function(req, res) {
  res.render('admin/blog/create');
});

// Load a draft for further editing.
router.post('/blog/create', function(req, res) {
  res.redirect('/admin/blog/create/' + req.body.link);
});

router.get('/blog/create/:link', function(req, res, next) {
  var query = Draft.findOne({link: req.params.link});
  query.exec(function(err, draft) {
    if (err) {
      next(err);
    } else if (draft === null || draft === undefined) {
      var err = new Error('Draft not found');
      err.status = 404;
      next(err);
    } else {
      res.render('admin/blog/create', {
        draft: draft,
        scripts: draft.formatScripts(),
        styles: draft.formatStyles()
      });
    }
  });
});

// Select an article to edit.
router.post('/blog/edit', function(req, res) {
  res.redirect('/admin/blog/edit/' + req.body.link);
});

// Publish a newly created article.
router.post('/blog/create/publish', function(req, res, next) {
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
    } else {
      // Remove drafts for this published article.
      Draft.remove({link: req.body.link}, function(err) {
        if (err) {
          next(err);
        }
      });
    }
  });
  res.redirect('/admin/blog');
});

// Save the article as an unpublished draft.
router.post('/blog/create/save', function(req, res, next) {
  Draft.update({link: req.body.link}, {
    title:       req.body.title,
    flavour:     req.body.flavour,
    description: req.body.description,
    body:        req.body.body,
    link:        req.body.link,
    scripts:     req.body.scripts.split('\n'),
    styles:      req.body.styles.split('\n')
  }, {upsert: true}, function(err) {
    if (err) {
      next(err);
    } else {
      console.log('Draft saved.');
    }
  });
  res.redirect('/admin/blog'); // Temporary, should do ajax request.
});

// Saves the updated version of the article.
router.post('/blog/edit/update', function(req, res) {
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
  res.redirect('/admin/blog/edit/' + req.body.link);
});

// Displays an existing article for editing.
router.get('/blog/edit/:link', function(req, res, next) {
  var query = Article.findOne({link: req.params.link});
  query.exec(function(err, article) {
    if (err) {
      next(err);
    } else if (article === null || article === undefined) {
      var err = new Error('Not found');
      err.status = 404;
      next(err);
    } else {
      res.render('admin/blog/edit', {
        article: article,
        scripts: article.formatScripts(),
        styles: article.formatStyles()
      });
    }
  });
});

module.exports = router;
