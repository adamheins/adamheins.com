/* Model of a project. */

var mongoose = require('mongoose');

var projectSchema = new mongoose.Schema({
  title: {
    text: String,
    link: String
  },
  date: Date,
  description: String,
  tags: [ String ],
  links: [{
    text: String,
    link: String
  }]
});

module.exports = mongoose.model('Project', projectSchema, 'projects');

