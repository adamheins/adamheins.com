var express = require('express');
var path = require('path');
var router = express.Router();
var moment = require('moment');

var Article = require('../models/article');

// Home page.
router.get('/', function(req, res) {
    var query = Article.find().sort({date_posted: -1}).limit(3);
    query.exec(function(err, articles) {
        res.render('index', { articles: articles });
    });
});

// Blog landing page.
router.get('/blog', function(req, res) {
  var query = Article.find().sort({date_posted: -1});
  query.exec(function(err, articles) {
    articles.forEach(function(article) {
      article.formattedDate = moment(new Date(article.date_posted)).local()
          .format('MMMM DD, YYYY');
    });
    res.render('blog', {"articles" : articles});
  });
});

// Get the page of the specified article.
router.get('/blog/:link', function(req, res, next) {
    var query = Article.findOne({link: req.params.link});
    query.exec(function(err, article) {
        if (article === null || article === undefined) {
            var err = new Error('Not found');
            err.status = 404;
            next(err);
        } else {
          article.comments.forEach(function(val, index, arr) {
            arr[index].time = moment(val.time).local()
                .format('MMMM DD, YYYY [at] h:mm a');
          });
          article.formattedDate = moment(new Date(article.date_posted)).local()
              .format('MMMM DD, YYYY');
          res.render('post', {article: article});
        }
    });
});

// Endpoint to submit a comment on an article.
router.post('/blog/:link/comment', function(req, res, next) {
  Article.update({link: req.params.link}, {
    $push: { comments: {
      name: res.locals.user.name,
      time: new Date(),
      content: req.body.content
    }}}, {upsert: true}, function(err) {
      if (err) {
        next(err);
      } else {
        res.redirect('/blog/' + req.params.link);
      }
    }
  );
});

// Endpoint to remove a comment from an article. Only available to an admin
// or the user that posted the comment.
router.post('/blog/:link/comment/:id/remove', function(req, res, next) {
  if (res.locals.isAdmin || res.locals.user.name === req.body.name) {
    Article.update({link: req.params.link}, {
      $pull: { comments: {
        _id: req.params.id
      }}}, function(err) {
        if (err) {
          next(err);
        } else {
          console.log('Comment removed.');
          res.redirect('/blog/' + req.params.link);
        }
      }
    );
  } else {
    res.redirect('/blog/' + req.params.link);
  }
});

// Projects page.
router.get('/projects', function(req, res) {
  res.render('projects');
});

// Resume landing page, which provides links to different formats.
router.get('/resume', function(req, res) {
  res.render('resume');
});

// PDF version of my resume.
router.get('/resume/pdf', function(req, res) {
  res.sendfile(path.join(__dirname, '../public/pdfs', 'resume.pdf'));
});

// JSON version of my resume.
router.get('/resume/json', function(req, res) {
  res.render('resume/json');
});

// About me page.
router.get('/about', function(req, res) {
  res.render('about');
});

module.exports = router;
