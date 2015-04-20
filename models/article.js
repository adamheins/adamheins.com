/* Module that models a blog article. */

var mongoose = require('mongoose');

var articleSchema = new mongoose.Schema({
  date_posted: { date: Date },
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

module.exports = mongoose.model('Article', articleSchema, 'posts');
