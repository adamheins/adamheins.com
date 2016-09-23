'use strict';

let express = require('express');
let router = express.Router();

router.get('/', (req, res) => {
  // Serve the static resume PDF.
  res.redirect(process.env.STATIC_HOST + '/resume/resume.pdf');
});

module.exports = router;
