'use strict';

var email = require('emailjs');

// Set up a simple smtp server.
exports.server = email.server.connect({
  user: process.env.AUTH_EMAIL_USER,
  password: process.env.AUTH_EMAIL_PASS,
  host: process.env.AUTH_EMAIL_SMTP,
  ssl: true
});
