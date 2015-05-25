/*
 * Formats characters when they are inside code blocks.
 *
 * @param c - The character to format.
 *
 * Returns the correctly escaped character.
 */
function formatCodeBlockChar(c) {
  if (c === '<') {
    return '&lt;';
  } else if (c === '>') {
    return '&gt;';
  }
  return c;
}

/*
 * Checks if the character is a special control character.
 * If so, it returns the correct escape sequence for the character.
 *
 * @param line - The current line of text.
 * @param i - Index of the current character on the line.
 *
 * Returns the correctly escaped character.
 */
function formatControlChar(line, i) {
  control_chars = ['/', '"'];
  if (control_chars.indexOf(line[i]) > -1) {
    // Character is already escaped.
    if (i !== 0 && line[i - 1] === '\\') {
      return line[i];
    }
    return '\\' + line[i];
  }
  return line[i];
}

/*
 * Checks if a code block has just started.
 *
 * @param line - The current line of text.
 * @param i - Index of the current character on the line.
 *
 * Returns true if a code block is starting, false otherwise.
 */
function isCodeStart(line, i) {
  return line.substring(i - 5, i + 1) === '<code>';
}

/*
 * Checks if a code block is just ending.
 *
 * @param line - The current line of text.
 * @param i - Index of the current character on the line.
 *
 * Returns true if a code block is ending, false otherwise.
 */
function isCodeEnd(line, i) {
  return line.substring(i, i + 7) === '</code>';
}

/*
 * Trims whitespace off of the right side of a string.
 *
 * @param str - The string to trim.
 *
 * Returns the trimmed string.
 */
function rightTrim(str) {
  return str.replace(/\s+$/gm, '');
}

/*
 * Parses text and formats it correctly for storage in a database.
 *
 * @param text - The text to format.
 *
 * Returns the correctly formatted text.
 */
function parseText(text) {
  body = [];
  inCodeBlock = false;
  lines = text.split('\n');

  lines.forEach(function(line) {
    line = rightTrim(line);
    for (var i = 0; i < line.length; ++i) {
      if (isCodeEnd(line, i)) {
        inCodeBlock = false;
      }

      var c = formatControlChar(line, i);
      if (inCodeBlock) {
        c = formatCodeBlockChar(c);
      }

      if (isCodeStart(line, i)) {
        inCodeBlock = true;
      }

      body.push(c);
    }

    // Include a line break only if we are in a code block.
    if (inCodeBlock) {
      body.push('\\n');
    }
  });
  return body.join('');
}

document.getElementById("blogger-btn").addEventListener("click", function() {
  var bodyTextArea = document.getElementById("body");
  var text = parseText(bodyTextArea.value);
  bodyTextArea.value = text;
});
