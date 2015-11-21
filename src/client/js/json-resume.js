'use strict';

// Load JSON resume for use in the console.

function ajaxRequest(url, callback) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) {
      callback(xmlhttp.responseText);
    }
  }
  xmlhttp.open('GET', url, true);
  xmlhttp.send();
}

var resume;
window.addEventListener('load', function load(e) {
  window.removeEventListener('load', load, false);
  ajaxRequest('/resume/resume.json', function(res) {
    resume = res;
  });
}, false);
