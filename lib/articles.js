'use strict';

const yaml = require('js-yaml');
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const pug = require('pug');
const merge = require('merge');

const md = require('./markdown');
const resolve = require('./resolve');
const spellcheck = require('./spellcheck');


const PRETTY_DATE_FORMAT = 'MMMM D, YYYY';
const REQUIRED_FIELDS = ['title', 'date', 'link', 'flavour', 'description',
                         'file', 'scripts', 'styles', 'private'];


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

    // Check for unexpected fields.
    keys.forEach(key => {
        if (REQUIRED_FIELDS.indexOf(key) < 0) {
            console.error(file + ' unknown field: ' + key);
            valid = false;
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

    if (config.spellcheck) {
        spellcheck.spellCheck(config, text);
    }
    data.html = md.markdown(text);

    data.scripts = data.scripts.map(resolve.script);
    data.styles = data.styles.map(resolve.style);

    data.fileName = data.link + '.html';
    if (!config.prod) {
        data.link = data.link + '.html';
    }

    // Format date.
    data.date = moment(data.date);
    data.prettyDate = data.date.local().format(PRETTY_DATE_FORMAT);

    return data;
}


module.exports.parseOne = parseOne;


// Parse articles from yaml and markdown files.
module.exports.parseAll = function(config) {
    let articles = [];
    let articlesGlob = config.paths.data.articles + '/**/*.yaml';

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
