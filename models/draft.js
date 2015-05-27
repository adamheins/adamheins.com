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

module.exports = mongoose.model('Draft', draftSchema, 'drafts');
