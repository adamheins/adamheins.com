'use strict';

const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');


// Configuration path to look for.
module.exports.CONFIG_PATH = 'config.yaml';


// Prepends the root path to all the other paths in the object.
function fullPath(paths) {
    let root = paths.root;
    Object.keys(paths).forEach(k => {
        if (k === 'root') {
            return;
        };
        paths[k] = path.join(root, paths[k]);
    });
}


// Load and preprocessor configuration data from provided path.
module.exports.load = function(configPath) {
    let config = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));

    fullPath(config.paths.templates);
    fullPath(config.paths.public);

    // Data directory is optional.
    if (config.paths.data) {
        fullPath(config.paths.data);
    }

    return config;
}
