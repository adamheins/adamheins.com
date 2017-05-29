#!/usr/bin/env node

'use strict';

let yaml = require('js-yaml');
let glob = require('glob');
let fs = require('fs');
let path = require('path');
let moment = require('moment');
let pug = require('pug');
let mkdirp = require('mkdirp');
let merge = require('merge');

let md = require('./lib/md');
let resolve = require('./lib/resolve');


const PRETTY_DATE_FORMAT = 'MMMM D, YYYY';
const REQUIRED_FIELDS = ['title', 'date', 'link', 'flavour', 'description',
                         'file', 'scripts', 'styles', 'private'];
const STATIC_HOST = 'https://static.adamheins.com';

const TEMPLATE_PATH = 'templates';
const ARTICLES_PATH = 'articles';
const PUBLIC_PATH = 'public';

const ARTICLE_TEMPLATE_PATH = path.join(TEMPLATE_PATH, 'blog/article.pug');
const ARTICLE_PUBLIC_DIR = path.join(PUBLIC_PATH, 'blog');

const ARTICLES_GLOB = ARTICLES_PATH + '/**/*.yaml';
const TEMPLATE_GLOB = TEMPLATE_PATH + '/**/*.pug'
const TEMPLATE_IGNORE = ['**/mixins/*', '**/includes/*', '**/article.pug'];


// Checks the article data to ensure all required fields exist.
function validateArticleData(file, data) {
    let keys = Object.keys(data);

    let valid = true;
    REQUIRED_FIELDS.forEach(field => {
        if (keys.indexOf(field) < 0) {
            console.log(file + ' missing field: ' + field);
            valid = false;
        }
    });
    return valid;
}


function templateToPublic(file, html) {
    let htmlFile = file.replace(TEMPLATE_PATH, PUBLIC_PATH)
                       .replace('.pug', '.html');
    let htmlDir = path.dirname(htmlFile)
    mkdirp.sync(htmlDir);
    fs.writeFileSync(htmlFile, html);
}


// Parse articles from yaml and markdown files.
function parseArticles() {
    let articles = [];
    glob.sync(ARTICLES_GLOB).forEach(file => {
        let data = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
        let valid = validateArticleData(file, data);

        // If the article is not valid, compilation fails.
        if (!valid) {
            process.exit(1);
        }

        // Skip this file if it is marked as private.
        if (data.private) {
            return;
        }

        // Parse body markdown file.
        let dirname = path.dirname(file);
        let bodyFile = path.join(dirname, data.file);
        data.html = md.markdown(fs.readFileSync(bodyFile, 'utf8'));

        data.scripts = data.scripts.map(resolve.script);
        data.styles = data.styles.map(resolve.style);

        // Format date.
        data['date'] = moment(data['date']);
        data['prettyDate'] = data['date'].local().format(PRETTY_DATE_FORMAT);

        articles.push(data);
    });

    // Sort articles by date in descending order.
    articles.sort((a, b) => {
        return a.date.isBefore(b.date);
    });

    return articles;
}


// Compile pug template files to html files.
function renderTemplates(articles) {
    let pugOptions = {
        basedir: TEMPLATE_PATH
    };

    let pugLocals = {
        articles: articles,
        articles3: articles.slice(0, 3),
        moment: moment,
        staticHost: STATIC_HOST
    }

    // Render non-article templates.
    glob.sync(TEMPLATE_GLOB, { ignore: TEMPLATE_IGNORE }).forEach(file => {
        let html = pug.renderFile(file, merge(pugOptions, pugLocals));
        templateToPublic(file, html);
    });

    // Render each article.
    let articleFunc = pug.compileFile(ARTICLE_TEMPLATE_PATH, pugOptions);
    articles.forEach(article => {
        let options = {
            article: article,
            doctype: 'html',
            moment: moment,
            staticHost: STATIC_HOST
        };
        let file = path.join(ARTICLE_PUBLIC_DIR, article.link + '.html');
        let html = articleFunc(options);
        fs.writeFileSync(file, html);
    });
}


function main() {
    let articles = parseArticles();
    renderTemplates(articles);
}

main();
