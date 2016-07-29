'use strict';

let express = require('express');
let router = express.Router();

let Article = require('../models/article');

router.get('/', (req, res, next) => {
  let query = Article.find({visible: true}).sort({date: -1}).limit(3);
  query.exec((err, articles) => {
    if (err) {
      next(err);
    } else {
      res.render('index', { articles: articles });
    }
  });
});

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/pgp', (req, res) => {
  res.render('pgp');
});

router.get('/tools', (req, res) => {
  res.render('tools');
});

module.exports = router;
