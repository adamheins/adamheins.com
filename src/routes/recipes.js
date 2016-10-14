'use strict';

let express = require('express');
let router = express.Router();

router.get('/', (req, res) => {
  res.render('recipes');
});

router.get('/bread', (req, res) => {
  res.render('recipes/bread');
});

router.get('/bread/basic', (req, res) => {
  res.render('recipes/bread/basic');
});

router.get('/bread/spicy', (req, res) => {
  res.render('recipes/bread/spicy');
});

router.get('/bread/cinnamon', (req, res) => {
  res.render('recipes/bread/cinnamon');
});

router.get('/no-regrets-french-toast', (req, res) => {
  res.render('recipes/no-regrets-french-toast');
});

router.get('/gin-blitz', (req, res) => {
  res.render('recipes/gin-blitz');
});

module.exports = router;
