#!/usr/bin/env node

'use strict';

const yaml = require('js-yaml');
const fs = require('fs');
const pug = require('pug');


function validate(data) {
    let valid = true;
    data.forEach(section => {
        section.projects.forEach(project => {
            if (!Object.keys(project.links).includes(project.title.link)) {
                console.error(project.title.name + ': Title link is missing or invalid.');
                valid = false;
            }
        });
    });
    return valid;
}

function render(data) {
    let pugOptions = {
        host: 'https://adamheins.com',
        staticHost: 'https://static.adamheins.com',
        year: '2017',
        sections: data,
        basedir: 'templates'
    };

    let html = pug.renderFile('templates/projects/test.pug', pugOptions);
    fs.writeFileSync('projects.html', html);
}


function main() {
    let data = yaml.safeLoad(fs.readFileSync('projects.yaml', 'utf8'));
    if (!validate(data)) {
        return false;
    }
    render(data);
    console.log('Rendered projects.');
}

main();
