window.addEventListener('load', function load(e) {
  window.removeEventListener('load', load, false);
  main();
}, false);

function main() {
  var articleTitle = document.getElementById('article-title');
  var articleFlavour = document.getElementById('article-flavour');
  var articleBody = document.getElementById('article-body');

  var titleInput = document.getElementById('title');
  var flavourInput = document.getElementById('flavour');
  var bodyInput = document.getElementById('body');

  titleInput.addEventListener('input', function() {
    articleTitle.innerHTML = titleInput.value;
  });

  flavourInput.addEventListener('input', function() {
    articleFlavour.innerHTML = flavourInput.value;
  });

  bodyInput.addEventListener('input', function() {
    articleBody.innerHTML = bodyInput.value;
  });
}
