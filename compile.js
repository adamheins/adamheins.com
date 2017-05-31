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

let md = require('./lib/markdown');
let resolve = require('./lib/resolve');


const PRETTY_DATE_FORMAT = 'MMMM D, YYYY';
const REQUIRED_FIELDS = ['title', 'date', 'link', 'flavour', 'description',
                         'file', 'scripts', 'styles', 'private'];
const TEMPLATE_IGNORE = ['**/mixins/*', '**/includes/*', '**/article.pug'];
const CONFIG_PATH = 'config.yaml';


function loadConfig(configPath) {
    return yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));
}


// Checks the article data to ensure all required fields exist.
function validateArticleData(file, data) {
    let keys = Object.keys(data);
    let valid = true;

    // Check that all required fields are present.
    REQUIRED_FIELDS.forEach(field => {
        if (keys.indexOf(field) < 0) {
            console.log(file + ' missing field: ' + field);
            valid = false;
        }
    });

    // Check for unexpected fields.
    keys.forEach(key => {
        if (REQUIRED_FIELDS.indexOf(key) < 0) {
            console.log(file + ' unknown field: ' + key);
            valid = false;
        }
    });

    return valid;
}


function templateToPublic(file, html, config) {
    let htmlFile = file.replace(config.paths.templates, config.paths.public)
                       .replace('.pug', '.html');
    let htmlDir = path.dirname(htmlFile)
    mkdirp.sync(htmlDir);
    fs.writeFileSync(htmlFile, html);
}


// Parse articles from yaml and markdown files.
function parseArticles(config) {
    let articles = [];
    let articlesGlob = config.paths.articles + '/**/*.yaml';

    glob.sync(articlesGlob).forEach(file => {
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

        data.fileName = data.link + '.html';
        if (config.local) {
            data.link = data.link + '.html';
        }

        // Format date.
        data.date = moment(data.date);
        data.prettyDate = data.date.local().format(PRETTY_DATE_FORMAT);

        articles.push(data);
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


// Compile pug template files to html files.
function renderTemplates(articles, config) {
    let localHost = path.join(fs.realpathSync('.'), config.paths.public)
    let host = config.local ? localHost : config.hosts.host;
    let year = moment().format('YYYY');

    let pugOptions = {
        basedir: config.paths.templates
    };

    let pugLocals = {
        articles:   articles,
        articles3:  articles.slice(0, 3),
        host:       host,
        staticHost: config.hosts.static,
        year:       year
    }

    // Render non-article templates.
    let templateGlob = config.paths.templates + '/**/*.pug'
    glob.sync(templateGlob, { ignore: TEMPLATE_IGNORE }).forEach(file => {
        let html = pug.renderFile(file, merge(pugOptions, pugLocals));
        templateToPublic(file, html, config);
    });

    // Render each article.
    let articleTemplatePath = path.join(config.paths.templates,
                                        'blog/article.pug');
    let articleFunc = pug.compileFile(articleTemplatePath, pugOptions);

    articles.forEach(article => {
        let options = {
            article:    article,
            host:       host,
            moment:     moment,
            staticHost: config.hosts.static,
            year:       year
        };

        let articlePublicDir = path.join(config.paths.public, 'blog');
        let file = path.join(articlePublicDir, article.fileName);
        let html = articleFunc(options);
        fs.writeFileSync(file, html);
    });
}


function main() {
    let config = loadConfig(CONFIG_PATH);
    let articles = parseArticles(config);
    console.log(articles.length + ' articles rendered.');
    renderTemplates(articles, config);
}

main();
