var mongoose = require('mongoose');
var privilege = require('../lib/privilege');

// Schema for a user on the website.
var userSchema = new mongoose.Schema({
  name: String,
  email: String,
  privilege: String,
  lastAccessed: Date
});

// Checks if the user is administrator.
userSchema.methods.isAdmin = function() {
  return privilege[this.privilege].hasAccess(privilege.ADMIN);
}

module.exports = mongoose.model('User', userSchema, 'users');

