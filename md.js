'use strict';

let marked = require('marked');
let renderer = new marked.Renderer();

renderer.code = function(code, lang) {
  // Default to language-none.
  if (!lang) {
    lang = 'none';
  }

  // Math blocks.
  if (lang === 'math') {
    return '<div class="math">' + code + '</div>';
  }

  return '<pre><code class="language-' + lang + '">' + code + '</code></pre>';
};

renderer.codespan = function(code) {
  code = code.replace('<', '&lt;').replace('>', '&gt;');
  return '<code class="language-none">' + code + '</code>';
};

renderer.image = function(href, title, text) {
    let img = '<img src="' + href + '" alt="' + text + '" title="' + title + '"/>';
    let caption = '<div class="caption">' + title + '</div>';
    return '<div class="img-wrapper">' + img + caption + '</div>';
}

module.exports.markdown = function(text) {
  return marked(text, {renderer: renderer});
}
