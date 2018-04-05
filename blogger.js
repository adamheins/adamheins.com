#!/usr/bin/env node

'use strict';

const moment = require('moment');
const program = require('commander');

const articleManager = require('./lib/articles');
const configManager = require('./lib/config');
const projectManager = require('./lib/projects');
const siteManager = require('./lib/site');


// Render a single article.
function one(datafile, plain, config) {
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

    let config = configManager.load(configManager.CONFIG_PATH);

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
