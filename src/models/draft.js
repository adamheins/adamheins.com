'use strict';

/* Model of an article draft. */

var mongoose = require('mongoose');

var draftSchema = new mongoose.Schema({
  scripts: [ String ],
  styles: [ String ],
  title: String,
  flavour: String,
  description: String,
  body: String,
  link: String
});

/*
 * Format the list of referenced scripts into a string with each script
 * on a new line.
 */
draftSchema.methods.formatScripts = function() {
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
draftSchema.methods.formatStyles = function() {
  var styles = '';
  this.styles.forEach(function(value) {
    styles = styles + value + '\n';
  });
  return styles.trim();
}

module.exports = mongoose.model('Draft', draftSchema, 'drafts');
