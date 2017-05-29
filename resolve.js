'use strict'


const STATIC_HOST = 'https://static.adamheins.com';
const SCRIPT_SHORTCUTS = {
    'prism': STATIC_HOST + '/js/prism.js',
    'mathjax': 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=default'
};
const STYLE_SHORTCUTS = {
    'prism': STATIC_HOST + '/css/prism.css'
}


module.exports.script = function(script) {
    // If the path starts with a slash, it is a local resource.
    if (script.charAt(0) === '/') {
        return STATIC_HOST + script;
    }

    // Check if the script it a shortcut.
    if (Object.keys(SCRIPT_SHORTCUTS).indexOf(script) > -1) {
        return SCRIPT_SHORTCUTS[script];
    }

    // Assume script is a resolvable URL at this point.
    return script;
}


module.exports.style = function(style) {
    // If the path starts with a slash, it is a local resource.
    if (style.charAt(0) === '/') {
        return STATIC_HOST + style;
    }

    // Check if the style it a shortcut.
    if (Object.keys(STYLE_SHORTCUTS).indexOf(style) > -1) {
        return STYLE_SHORTCUTS[style];
    }

    // Assume style is a resolvable URL at this point.
    return style;
}
