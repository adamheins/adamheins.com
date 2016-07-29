'use strict';

let express = require('express');
let router = express.Router();
let moment = require('moment');

let Article = require('../models/article');

let PUBLICATION_DATE_FORMAT = 'MMMM D, YYYY';
let COMMENT_DATE_FORMAT = PUBLICATION_DATE_FORMAT + ' [at] h:mm a';

// Blog landing page.
router.get('/', (req, res, next) => {
  Article.find({visible: true}).sort({date: -1}).exec((err, articles) => {
    if (err) {
      next(err);
    } else {
      articles.forEach(article => {
        article.formattedDate = moment(new Date(article.date)).local()
            .format(PUBLICATION_DATE_FORMAT);
      });
      res.render('blog/index', {'articles': articles});
    }
  });
});

// Get the page of the specified article.
router.get('/:link', (req, res, next) => {
  Article.findOne({
    link: req.params.link,
    visible: true
  }).exec((err, article) => {
    if (err) {
      next(err);
    } else if (article === null || article === undefined) {
      let err = new Error('Not found');
      err.status = 404;
      next(err);
    } else {
      article.comments.forEach((val, index, arr) => {
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
