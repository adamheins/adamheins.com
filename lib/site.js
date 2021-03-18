'use strict';

const fs = require('fs');
const glob = require('glob');
const merge = require('merge');
const mkdirp = require('mkdirp');
const moment = require('moment');
const path = require('path');
const pug = require('pug');

const articleManager = require('./articles');
const projectManager = require('./projects');


const TEMPLATE_IGNORE = ['**/mixins/*', '**/includes/*', '**/blog/article.pug',
                         '**/projects/index.pug', '**/blog/plain.pug'];


// Write a template file to a public file with the given html content.
function templateToPublic(file, html, config) {
    let htmlFile = file.replace(config.paths.templates.root,
                                config.paths.public.root)
                       .replace('.pug', '.html');
    let htmlDir = path.dirname(htmlFile)
    mkdirp.sync(htmlDir);
    fs.writeFileSync(htmlFile, html);
}


// Compile pug template files to html files.
module.exports.render = function(articles, projectData, config) {
    let pugOptions = {
        basedir:    config.paths.templates.root,
        host:       config.hosts.host,
        staticHost: config.hosts.static,
        year:       moment().format('YYYY')
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

    articleManager.render(articles, false, config, pugOptions);
    projectManager.render(projectData, config, pugOptions);
}
