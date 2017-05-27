'use strict';

let yaml = require('js-yaml');
let glob = require('glob');
let fs = require('fs');
let path = require('path');
let moment = require('moment');
let pug = require('pug');

let md = require('./md');


const PRETTY_DATE_FORMAT = 'MMMM D, YYYY';
const REQUIRED_FIELDS = ['title', 'date', 'link', 'flavour', 'description',
                         'file', 'scripts', 'styles'];
const TEMPLATE_PATH = './templates';
const ARTICLES_PATH = './articles';

let ARTICLES_GLOB = ARTICLES_PATH + '/**/*.yaml';


const PUG_TEMPLATE = `
each article in articles
  section
    h2
      a(href= '/blog/' + article.link)= article.title
    .date= article.prettyDate
    p.description= article.description
`;

let articles = [];


// Checks the article data to ensure all required fields exist.
function validateArticleData(file, data) {
    let keys = Object.keys(data);
    let fileName = path.basename(file);

    let valid = true;
    REQUIRED_FIELDS.forEach(field => {
        if (keys.indexOf(field) < 0) {
            console.log(fileName + ' missing field: ' + field);
            valid = false;
        }
    });
    return valid;
}


glob(ARTICLES_GLOB, (err, files) => {
    if (err) {
        console.log(err);
        return 1;
    }

    files.forEach(file => {
        let data = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
        let valid = validateArticleData(file, data);

        if (!valid) {
            process.exit(1);
        }

        // Parse body markdown file.
        let dirname = path.dirname(file);
        let bodyFile = path.join(dirname, data['file']);
        let html = md.markdown(fs.readFileSync(bodyFile, 'utf8'));
        data['html'] = html;

        // Format date.
        data['date'] = moment(data['date']);
        data['prettyDate'] = data['date'].local().format(PRETTY_DATE_FORMAT);

        articles.push(data);
    });

    // Sort articles by date in descending order.
    articles.sort((a, b) => {
        return a.date.isBefore(b.date);
    });

    // Build blog index page.
    let render = pug.compile(PUG_TEMPLATE);
    let html = render({ articles: articles });
    console.log(html);

    // articles.forEach(article => {
    //     console.log(article.title);
    // });

});
