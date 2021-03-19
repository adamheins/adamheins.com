'use strict';

const yaml = require('js-yaml');
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const pug = require('pug');
const merge = require('merge');

const md = require('./markdown');


const PRETTY_DATE_FORMAT = 'MMMM D, YYYY';
const REQUIRED_FIELDS = ['title', 'date', 'link', 'flavour', 'description',
                         'file', 'scripts', 'styles', 'private'];

// Sources for external resources can be lists or single strings.
const REMOTE_SCRIPT_SHORTCUTS = {
    'mathjax': [
        'https://polyfill.io/v3/polyfill.min.js?features=es6',
        'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js'
    ]
};
const REMOTE_STYLE_SHORTCUTS = { };

// Resolve shortcuts to scripts and style files in an article.
// Parameters:
//   name: the shortcut string
//   staticHost: the static host for the current environment
//   shortcuts: the map of remote shortcuts
function resolveShortcuts(name, staticHost, shortcuts, is_style) {
    // If the path starts with a slash, it is a local resource.
    // TODO: this is not how I've been doing things...
    if (name.charAt(0) === '/') {
        return staticHost + name;
    }

    // TODO fix!!!
    if (name === 'prism') {
        if (is_style) {
            return staticHost + '/css/' + name + '.css';
        } else {
            return staticHost + '/js/' + name + '.js';
        }
    }

    // Check if the style it a shortcut.
    if (Object.keys(shortcuts).indexOf(name) > -1) {
        return shortcuts[name];
    }

    // Otherwise, assume path is a resolvable URL
    return name;
}


// Checks the article data to ensure all required fields exist.
function validateArticleData(file, data) {
    let keys = Object.keys(data);
    let valid = true;

    // Check that all required fields are present.
    REQUIRED_FIELDS.forEach(field => {
        if (keys.indexOf(field) < 0) {
            console.error(file + ' missing field: ' + field);
            valid = false;
        }
    });

    // Check for unexpected fields -- this is just a warning.
    keys.forEach(key => {
        if (REQUIRED_FIELDS.indexOf(key) < 0) {
            console.warn(file + ' unknown field: ' + key);
        }
    });

    return valid;
}


// Parse a single article.
function parseOne(config, datafile) {
    let data = yaml.safeLoad(fs.readFileSync(datafile, 'utf8'));
    let valid = validateArticleData(datafile, data);

    // If the article is not valid, compilation fails.
    if (!valid) {
        process.exit(1);
    }

    // Skip this file if it is marked as private.
    if (data.private) {
        return;
    }

    // Parse body markdown file.
    let dirname = path.dirname(datafile);
    let bodyFile = path.join(dirname, data.file);
    let text = fs.readFileSync(bodyFile, 'utf8');

    data.html = md.markdown(text);
    data.scripts = data.scripts.flatMap(name => {
        return resolveShortcuts(name, config.hosts.static, REMOTE_SCRIPT_SHORTCUTS, false);
    });
    data.styles = data.styles.flatMap(name => {
        return resolveShortcuts(name, config.hosts.static, REMOTE_STYLE_SHORTCUTS, true);
    });

    data.fileName = data.link + '.html';

    if (config['links-include-extension']) {
        data.link = data.link + '.html';
    }

    // Format date.
    data.date = moment(data.date);
    data.prettyDate = data.date.local().format(PRETTY_DATE_FORMAT);

    // Parse meta tags
    if (data.meta) {
        let meta = data.meta.map(tag => {
            let attributes = Object.keys(tag).map(key => {
                return `${key}="${tag[key]}"`
            });
            return `<meta ${attributes.join(' ')} >`;
        });
        data.meta = meta;
    }

    return data;
}


module.exports.parseOne = parseOne;


// Parse articles from yaml and markdown files.
module.exports.parseAll = function(config) {
    let articles = [];
    let articlesGlob = config.paths.data.articles + '/**/data.yaml';

    glob.sync(articlesGlob, { ignore: ['drafts/*'] }).forEach(file => {
        articles.push(parseOne(config, file));
    });

    // Sort articles by date in descending order.
    articles.sort((a, b) => {
        if (a.date.isBefore(b.date)) {
            return 1;
        } else if (a.date.isAfter(b.date)) {
            return -1;
        }
        return 0;
    })

    return articles;
}


// Render article data to HTML.
module.exports.render = function(articles, plain, config, pugOptions) {
    let template = plain ? config.paths.templates.plain
                         : config.paths.templates.article;
    let articleFunc = pug.compileFile(template, pugOptions);

    // Render each article.
    articles.forEach(article => {
        let options = merge(pugOptions, {
            article:    article,
            moment:     moment,
        });

        let articlePublicDir = config.paths.public.articles;
        let file = path.join(articlePublicDir, article.fileName);
        let html = articleFunc(options);
        fs.writeFileSync(file, html);
    });
}
