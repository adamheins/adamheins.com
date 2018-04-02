'use strict';

const marked = require('marked');
const spellcheck = require('spellchecker');
const fs = require('fs');


function uniq(a) {
    let seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}


function checkSpelling(text) {
    return spellcheck.checkSpelling(text).map(misspelling => {
        let start = misspelling.start;
        let end = misspelling.end;
        let word = text.substring(start, end);
        return word;
    });
}


let spellChecker = new marked.Renderer();

spellChecker.misspellings = [];

// Hook into the text rendering function to do spellchecking.
spellChecker.text = function(text) {
    text = text.replace(/&#39;/g, "'");
    let misspellings = checkSpelling(text);
    this.misspellings = this.misspellings.concat(misspellings);
    return text;
}

module.exports.spellCheck = function(config, text) {
    marked(text, {renderer: spellChecker});
    let misspellings = uniq(spellChecker.misspellings);

    // We may have a custom dictionary of words to check against as well.
    if ('dict' in config.paths) {
        let customDict = fs.readFileSync(config.paths.dict, 'utf8').trim().split('\n');
        misspellings = misspellings.filter(misspelling => {
            return customDict.indexOf(misspelling) == -1;
        });
    }

    if (misspellings.length > 0) {
        console.log('These words may be misspelled:');
        misspellings.forEach(misspelling => {
            console.log('  ' + misspelling);
        });
    }
}
