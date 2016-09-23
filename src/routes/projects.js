'use strict';

let express = require('express');
let router = express.Router();

router.get('/', (req, res) => {
  res.render('projects');
});

module.exports = router;
