'use strict';

/* Module that models a blog article. */

let mongoose = require('mongoose');

let articleSchema = new mongoose.Schema({
  date: Date,
  scripts: [ String ],
  styles: [ String ],
  title: String,
  formatted_date: String,
  flavour: String,
  description: String,
  body: String,
  comments: [{name: String, time: String, content: String}],
  link: String,
  visible: Boolean
});

/*
 * Format the list of referenced scripts into a string with each script
 * on a new line.
 */
articleSchema.methods.formatScripts = function() {
  let scripts = '';
  this.scripts.forEach(value => {
    scripts = scripts + value + '\n';
  });
  return scripts.trim();
}

/*
 * Format the list of referenced styles into a string with each style
 * on a new line.
 */
articleSchema.methods.formatStyles = function() {
  let styles = '';
  this.styles.forEach(value => {
    styles = styles + value + '\n';
  });
  return styles.trim();
}

module.exports = mongoose.model('Article', articleSchema, 'posts');
