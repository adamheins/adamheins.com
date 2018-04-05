'use strict';

const path = require('path');
const pug = require('pug');
const fs = require('fs');
const merge = require('merge');
const mkdirp = require('mkdirp');
const yaml = require('js-yaml');


// Parse project data from yaml config file.
module.exports.parse = function(config) {
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


// Render project data to HTML.
module.exports.render = function(projectData, config, pugOptions) {
    let options = merge(pugOptions, { sections: projectData });
    let html = pug.renderFile(config.paths.templates.projects, options);

    let outFile = path.join(config.paths.public.projects, 'index.html');
    mkdirp.sync(path.dirname(outFile));
    fs.writeFileSync(outFile, html);
}
