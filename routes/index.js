var express = require('express');
var path = require('path');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('posts');
    collection.find({}, {sort: {date_posted : -1}, limit: 3}, function(error, articles) {
        res.render('index', { articles: articles });
    });
});


/* GET blog page. */
router.get('/blog', function(req, res) {
    var db = req.db;
    var collection = db.get('posts');
    collection.find({}, {sort: {date_posted : -1}}, function(error, docs) {
        res.render('blog', {"posts" : docs});
    });
});


/* GET the page for a specific article. */
router.get('/blog/:link', function(req, res, next) {
    var db = req.db;
    var collection = db.get('posts');
    collection.findOne({link: req.params.link}, function(error, article) {
        if (article === null || article === undefined) {
            var err = new Error('Not found');
            err.status = 404;
            next(err);
        } else
            res.render('post', {article: article});
    });
});


/** GET projects page. */
router.get('/projects', function(req, res) {
    res.render('projects');
});


/** GET the resume page. */
router.get('/resume', function(req, res) {
    var resume = 'resume.pdf';
    res.sendfile(path.join(__dirname, '../public/pdfs', 'resume.pdf'));
});


/** GET the about page. */
router.get('/about', function(req, res) {
    res.render('about');
});


/** GET the special page made for Melanie. */
router.get('/melanie', function(req, res) {
    res.render('anniversary');
});

module.exports = router;
