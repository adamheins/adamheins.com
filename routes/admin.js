var express = require('express');
var path = require('path');
var passwordless = require('passwordless');
var router = express.Router();

var Article = require('../models/article');

router.get('/', function(req, res) {
  res.render('admin');
});

router.get('/blog', function(req, res) {
  res.render('admin/blog');
});

router.post('/blog', function(req, res) {
  res.redirect('/admin/blog');
});

router.get('/blog/create', function(req, res) {
  res.render('admin/blog/create');
});

router.post('/blog/view', function(req, res) {
  res.redirect('/admin/blog/view/' + req.body.link);
});

/* Saves the updated version of the article. */
router.post('/blog/save', function(req, res) {
  Article.update({link: req.body.link}, {
    title: req.body.title,
    flavour: req.body.flavour,
    description: req.body.description,
    body: req.body.body,
    link: req.body.link
  }, function(err, num, raw) {
    if (err) {
      next(err);
    } else {
      console.log('Article updated.');
    }
  });
  res.redirect('/admin/blog/view/' + req.body.link);
});

router.post('/blog/draft', function(req, res) {
  console.log('This is where a blog post would be saved as a draft.');
  res.redirect('/admin/blog');
});

/* Displays an existing article for viewing and editing. */
router.get('/blog/view/:link', function(req, res) {
    console.log(req.params.link);
    var query = Article.findOne({link: req.params.link});
    query.exec(function(err, article) {
        if (article === null || article === undefined) {
            var err = new Error('Not found');
            err.status = 404;
            next(err);
        } else {
            res.render('admin/blog/view', {article: article});
        }
    });
});

module.exports = router;