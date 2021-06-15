'use strict';

const Feed = require('feed').Feed;
const fs = require('fs');


// Render rss.xml from article data.
module.exports.write = function(articles, config) {
    const feed = new Feed({
        title: "adamheins.com",
        description: "The blog and project site of Adam Heins.",
        link: "https://adamheins.com/",
        language: "en",
        generator: null, // optional, default = 'Feed for Node.js'
        docs: null,
        author: {
            name: "Adam Heins",
            email: "mail@adamheins.com"
        }
    });

    // keep three most recent articles
    articles.slice(0, 3).forEach(article => {
        feed.addItem({
            title: article.title,
            id: article.link,
            link: config.hosts.host + '/' + article.link,
            description: article.description,
            content: article.html,
            author: [{
                name: "Adam Heins",
                email: "mail@adamheins.com"
            }],
            date: article.date.toDate()
        });
    });

    const path = config.paths.public.root + '/rss.xml';
    fs.writeFileSync(path, feed.rss2());
}
