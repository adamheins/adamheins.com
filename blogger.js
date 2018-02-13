#!/usr/bin/env node

'use strict';

const yaml = require('js-yaml');
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const pug = require('pug');
const mkdirp = require('mkdirp');
const merge = require('merge');

const md = require('./lib/markdown');
const resolve = require('./lib/resolve');


const PRETTY_DATE_FORMAT = 'MMMM D, YYYY';
const REQUIRED_FIELDS = ['title', 'date', 'link', 'flavour', 'description',
                         'file', 'scripts', 'styles', 'private'];
const TEMPLATE_IGNORE = ['**/mixins/*', '**/includes/*', '**/article.pug',
                         '**/projects/index.pug'];
const CONFIG_PATH = 'config.yaml';


function loadConfig(configPath) {
    let config = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));

    let templateRoot = config.paths.templates.root;
    let templateArticles = config.paths.templates.article;
    let templateProjects = config.paths.templates.projects;

    config.paths.templates.article = path.join(templateRoot, templateArticles);
    config.paths.templates.projects = path.join(templateRoot, templateProjects);

    return config
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

    // Check for unexpected fields.
    keys.forEach(key => {
        if (REQUIRED_FIELDS.indexOf(key) < 0) {
            console.error(file + ' unknown field: ' + key);
            valid = false;
        }
    });

    return valid;
}


// Write a template file to a public file with the given html content.
function templateToPublic(file, html, config) {
    let htmlFile = file.replace(config.paths.templates.root, config.paths.public)
                       .replace('.pug', '.html');
    let htmlDir = path.dirname(htmlFile)
    mkdirp.sync(htmlDir);
    fs.writeFileSync(htmlFile, html);
}


// Parse a single article.
function parseArticle(config, data_file) {
    let data = yaml.safeLoad(fs.readFileSync(data_file, 'utf8'));
    let valid = validateArticleData(data_file, data);

    // If the article is not valid, compilation fails.
    if (!valid) {
        process.exit(1);
    }

    // Skip this file if it is marked as private.
    if (data.private) {
        return;
    }

    // Parse body markdown file.
    let dirname = path.dirname(data_file);
    let bodyFile = path.join(dirname, data.file);
    data.html = md.markdown(fs.readFileSync(bodyFile, 'utf8'));

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


// Parse articles from yaml and markdown files.
function parseArticles(config) {
    let articles = [];
    let articlesGlob = config.paths.articles + '/**/*.yaml';

    glob.sync(articlesGlob, { ignore: ['drafts/*'] }).forEach(file => {
        articles.push(parseArticle(config, file));
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


function renderArticles(articles, config, pugOptions) {
    let articleFunc = pug.compileFile(config.paths.templates.article,
                                      pugOptions);
    // Render each article.
    articles.forEach(article => {
        let options = merge(pugOptions, {
            article:    article,
            moment:     moment,
        });

        // TODO need to fix before merge
        let articlePublicDir = config.paths.public;
        let file = path.join(articlePublicDir, article.fileName);
        let html = articleFunc(options);
        fs.writeFileSync(file, html);
    });
}


// Compile pug template files to html files.
function renderTemplates(articles, config) {
    let localHost = path.join(fs.realpathSync('.'), config.paths.public)
    let host = config.prod ? config.hosts.host : localHost;
    let year = moment().format('YYYY');

    let pugOptions = {
        basedir:    config.paths.templates.root,
        host:       host,
        staticHost: config.hosts.static,
        year:       year
    };

    let pugLocals = {
        articles:   articles,
        articles3:  articles.slice(0, 3)
    };

    // Render non-article templates.
    let templateGlob = config.paths.templates.root + '/**/*.pug'
    glob.sync(templateGlob, { ignore: TEMPLATE_IGNORE }).forEach(file => {
        let html = pug.renderFile(file, merge(pugOptions, pugLocals));
        templateToPublic(file, html, config);
    });

    renderArticles(articles, config, pugOptions);
}

function one() {
    if (process.argv.length < 3) {
        console.log('Usage: blogger data.yaml');
        return 1;
    }

    let config = loadConfig(CONFIG_PATH);

    let data_file = process.argv[2];

    let article = parseArticle(config, data_file);

    let pugOptions = {
        basedir:    config.paths.templates.root,
        host:       config.hosts.host,
        staticHost: config.hosts.static,
        year:       moment().format('YYYY')
    };

    renderArticles([article], config, pugOptions);
}


function main() {
    if (process.argv.length < 3) {
        console.log('Usage: blogger {[d]evelopment|[p]roduction}');
        return 1;
    }

    let config = loadConfig(CONFIG_PATH);

    // Development vs. production environment is specified on the command line.
    let environment = process.argv[2].toLowerCase();
    if ('production'.startsWith(environment)) {
        config.prod = true;
    } else if ('development'.startsWith(environment)) {
        config.prod = false;
    } else {
        console.log('Invalid value passed for environment.');
        return 1;
    }

    let articles = parseArticles(config);
    renderTemplates(articles, config);

    console.log(articles.length + ' articles rendered.');
}

// main();
one();
