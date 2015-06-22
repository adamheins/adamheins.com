'use strict';

// Manage user access rights.
function Privilege(value) {
  this.value = value;
}

Privilege.prototype.hasAccess = function(privilege) {
  return this.value <= privilege.value;
}

var privilege = {
  ADMIN   : new Privilege(0),
  SUB     : new Privilege(1),
  DEFAULT : new Privilege(2)
}

module.exports = privilege;
