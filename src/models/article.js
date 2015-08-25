'use strict';

/* Module that models a blog article. */

var mongoose = require('mongoose');

var articleSchema = new mongoose.Schema({
  date_posted: Date,
  scripts: [ String ],
  styles: [ String ],
  title: String,
  formatted_date: String,
  flavour: String,
  description: String,
  body: String,
  comments: [{name: String, time: String, content: String}],
  link: String
});

/*
 * Format the list of referenced scripts into a string with each script
 * on a new line.
 */
articleSchema.methods.formatScripts = function() {
  var scripts = '';
  this.scripts.forEach(function(value) {
    scripts = scripts + value + '\n';
  });
  return scripts.trim();
}

/*
 * Format the list of referenced styles into a string with each style
 * on a new line.
 */
articleSchema.methods.formatStyles = function() {
  var styles = '';
  this.styles.forEach(function(value) {
    styles = styles + value + '\n';
  });
  return styles.trim();
}

module.exports = mongoose.model('Article', articleSchema, 'posts');
