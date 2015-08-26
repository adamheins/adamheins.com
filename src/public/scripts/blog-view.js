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
  var articleDate = document.getElementById('article-date');
  var articleTitle = document.getElementById('article-title');
  var articleFlavour = document.getElementById('article-flavour');
  var articleBody = document.getElementById('article-body');

  var titleInput = document.getElementById('title');
  var flavourInput = document.getElementById('flavour');
  var bodyInput = document.getElementById('body');

  if (articleTitle.innerHTML === '') {
    articleDate.style.display = 'none';
  } else {
    articleDate.style.display = 'block';
  }

  titleInput.addEventListener('input', function() {
    var title = titleInput.value;
    articleTitle.innerHTML = title;
    if (title === '') {
      articleDate.style.display = 'none';
      articleFlavour.style.display = 'none';
    } else {
      articleDate.style.display = 'block';
      articleFlavour.style.display = 'block';
    }
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
