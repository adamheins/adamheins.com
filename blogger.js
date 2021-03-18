#!/usr/bin/env node

'use strict';

const moment = require('moment');
const program = require('commander');

const articleManager = require('./lib/articles');
const configManager = require('./lib/config');
const projectManager = require('./lib/projects');
const siteManager = require('./lib/site');


// Render a single article.
function build_one_article(datafile, plain, config) {
    let article = articleManager.parseOne(config, datafile);

    let pugOptions = {
        basedir:    config.paths.templates.root,
        host:       config.hosts.host,
        staticHost: config.hosts.static,
        year:       moment().format('YYYY')
    };

    articleManager.render([article], plain, config, pugOptions);
}


// Render everything: all articles and projects.
function build_site(config) {
    let articles = articleManager.parseAll(config);
    let projectData = projectManager.parse(config);

    siteManager.render(articles, projectData, config);

    console.log(articles.length + ' articles rendered.');
    console.log('Projects rendered.');
}


function main() {
    let args = process.argv;
    if (args.length < 3) {
        console.log('Usage: blogger {one|all} [...]');
        return 1;
    }


    let cmd = args[2];
    if (cmd === 'one') {
        program.command('one <datafile>')
               .option('-p, --plain', 'Render without header and footer.')
               .action((datafile, cmd) => {
                   // If we're only rendering a single article, it's assumed
                   // we're in the dev environment.
                   let config = configManager.load(configManager.CONFIG_PATH_DEV);
                   build_one_article(datafile, !!cmd.plain, config);
               });
        program.parse(args);
    } else if (cmd === 'all') {
        program.command('all <type>')
               .action(type => {
                   let configPath = configManager.CONFIG_PATH_DEV;
                   if (type === "production") {
                       configPath = configManager.CONFIG_PATH_PROD;
                   }
                   let config = configManager.load(configPath);
                   build_site(config);
               });
        program.parse(args);
    } else {
        console.log('Usage: blogger {one|all} [...]');
        return 1;
    }
}


main();
