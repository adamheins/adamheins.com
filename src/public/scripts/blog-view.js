'use strict';

window.addEventListener('load', function load(e) {
  window.removeEventListener('load', load, false);
  main();
}, false);

/*
 * Update the document appearance based on whether it is currently saved or not.
 */
function saved(saved) {
  var title = document.title
  if (saved) {
    if (title.charAt(0) === '*') {
      title = title.slice(1);
    }
  } else {
    if (title.charAt(0) !== '*') {
      title = '*' + title;
    }
  }
  document.title = title;
}

function main() {
  var articleTitle = document.getElementById('article-title');
  var articleFlavour = document.getElementById('article-flavour');
  var articleBody = document.getElementById('article-body');

  var titleInput = document.getElementById('title');
  var flavourInput = document.getElementById('flavour');
  var bodyInput = document.getElementById('body');

  titleInput.addEventListener('input', function() {
    articleTitle.innerHTML = titleInput.value;
    saved(false);
  });

  flavourInput.addEventListener('input', function() {
    articleFlavour.innerHTML = flavourInput.value;
    saved(false);
  });

  bodyInput.addEventListener('input', function() {
    articleBody.innerHTML = bodyInput.value;
    saved(false);
  });
}
