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
const program = require('commander');

const md = require('./lib/markdown');
const resolve = require('./lib/resolve');
const spellcheck = require('./lib/spellcheck');


const PRETTY_DATE_FORMAT = 'MMMM D, YYYY';
const REQUIRED_FIELDS = ['title', 'date', 'link', 'flavour', 'description',
                         'file', 'scripts', 'styles', 'private'];
const TEMPLATE_IGNORE = ['**/mixins/*', '**/includes/*', '**/blog/article.pug',
                         '**/projects/index.pug', '**/blog/plain.pug'];
const CONFIG_PATH = 'config.yaml';


function fullPath(paths) {
    let root = paths.root;
    Object.keys(paths).forEach(k => {
        if (k === 'root') {
            return;
        };
        paths[k] = path.join(root, paths[k]);
    });
}


function loadConfig(configPath) {
    let config = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));

    fullPath(config.paths.templates);
    fullPath(config.paths.public);

    // Data directory is optional.
    if (config.paths.data) {
        fullPath(config.paths.data);
    }

    return config;
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
    let htmlFile = file.replace(config.paths.templates.root, config.paths.public.root)
                       .replace('.pug', '.html');
    let htmlDir = path.dirname(htmlFile)
    mkdirp.sync(htmlDir);
    fs.writeFileSync(htmlFile, html);
}


// Parse a single article.
function parseArticle(config, datafile) {
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


// Parse articles from yaml and markdown files.
function parseArticles(config) {
    let articles = [];
    let articlesGlob = config.paths.data.articles + '/**/*.yaml';

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


function renderArticles(articles, plain, config, pugOptions) {
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


function parseProjects(config) {
    let data = yaml.safeLoad(fs.readFileSync(config.paths.data.projects, 'utf8'));

    data.forEach(section => {
        section.projects.forEach(project => {
            let links = project.links;

            // Reform the links list into an object that allows for easier
            // templating.
            if (links.length > 0) {
                project.links = {
                    notLast: links.slice(0, -1),
                    last: links.slice(-1)[0],
                };
            } else {
                project.links = {
                    notLast: [],
                };
            }
        });
    });

    return data;
}


function renderProjects(projectData, config, pugOptions) {
    let options = merge(pugOptions, { sections: projectData });
    let html = pug.renderFile(config.paths.templates.projects, options);

    let outFile = path.join(config.paths.public.projects, 'index.html');
    mkdirp.sync(path.dirname(outFile));
    fs.writeFileSync(outFile, html);
}


// Compile pug template files to html files.
function renderSite(articles, projectData, config) {
    let localHost = path.join(fs.realpathSync('.'), config.paths.public.root)
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

    renderArticles(articles, false, config, pugOptions);
    renderProjects(projectData, config, pugOptions);
}


// Render a single article.
function one(datafile, plain, config) {
    let article = parseArticle(config, datafile);

    let pugOptions = {
        basedir:    config.paths.templates.root,
        host:       config.hosts.host,
        staticHost: config.hosts.static,
        year:       moment().format('YYYY')
    };

    renderArticles([article], plain, config, pugOptions);
}


// Render everything: all articles and projects.
function all(type, config) {

    // Development vs. production environment is specified on the command line.
    if ('production'.startsWith(type)) {
        config.prod = true;
    } else if ('development'.startsWith(type)) {
        config.prod = false;
    } else {
        console.log('Invalid value passed for environment.');
        return 1;
    }

    let articles = parseArticles(config);
    let projectData = parseProjects(config);

    renderSite(articles, projectData, config);

    console.log(articles.length + ' articles rendered.');
    console.log('Projects rendered.');
}


function main() {
    let args = process.argv;
    if (args.length < 3) {
        console.log('Usage: blogger {one|all} [...]');
        return 1;
    }

    let config = loadConfig(CONFIG_PATH);

    let cmd = args[2];
    if (cmd === 'one') {
        program.command('one <datafile>')
               .option('-p, --plain', 'Render without header and footer.')
               .option('-s, --spellcheck', 'Perform spellcheck on article.')
               .action((datafile, cmd) => {
                   config.spellcheck = !!cmd.spellcheck;
                   one(datafile, !!cmd.plain, config);
               });
        program.parse(args);
    } else if (cmd === 'all') {
        program.command('all <type>')
               .action(type => {
                   all(type, config);
               });
        program.parse(args);
    } else {
        console.log('Usage: blogger {one|all} [...]');
        return 1;
    }
}

main();
