'use strict';

// Clear current comment content.
var clearButton = document.getElementById('clear');
if (clearButton) {
  clearButton.addEventListener('click', function() {
    document.getElementById('comment').value = '';
  });
}
