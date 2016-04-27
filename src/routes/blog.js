'use strict';

var express = require('express');
var router = express.Router();
var moment = require('moment');

var Article = require('../models/article');

var PUBLICATION_DATE_FORMAT = 'MMMM D, YYYY';
var COMMENT_DATE_FORMAT = PUBLICATION_DATE_FORMAT + ' [at] h:mm a';

// Blog landing page.
router.get('/', function(req, res) {
  var query = Article.find().sort({date: -1});
  query.exec(function(err, articles) {
    articles.forEach(function(article) {
      article.formattedDate = moment(new Date(article.date)).local()
          .format(PUBLICATION_DATE_FORMAT);
    });
    res.render('blog/index', {'articles': articles});
  });
});

// Get the page of the specified article.
router.get('/:link', function(req, res, next) {
  var query = Article.findOne({link: req.params.link});
  query.exec(function(err, article) {
    if (article === null || article === undefined) {
      var err = new Error('Not found');
      err.status = 404;
      next(err);
    } else {
      article.comments.forEach(function(val, index, arr) {
        arr[index].time = moment(val.time).local()
            .format(COMMENT_DATE_FORMAT);
      });
      article.formattedDate = moment(new Date(article.date)).local()
          .format(PUBLICATION_DATE_FORMAT);
      res.render('blog/article', {article: article});
    }
  });
});

module.exports = router;
