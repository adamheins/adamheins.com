'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var del = require('del');
var merge = require('merge-stream');
var order = require('gulp-order');
var filter = require('gulp-filter');

var paths = {
  src: 'src/client',
  dest: 'src/public'
};
paths.js = {
  cust: [paths.src + '/js/**/*.js', '!' + paths.src + '/js/ext/**/*.js'],
  ext: [paths.src + '/js/ext/**/*.js'],
  cat: [],
  dest: paths.dest + '/js'
};
paths.css = {
  cust: [paths.src + '/css/**/*.css', paths.src + '/css/**/*.scss',
         '!' + paths.src + '/css/ext/**/*.css'],
  ext: [paths.src + '/css/ext/**/*.css'],
  cat: ['opensans.css', 'ubuntu.css', 'fa.css', 'style.css'],
  dest: paths.dest + '/css'
};
paths.res = {
  all: [paths.src + '/res/*'],
  dest: paths.dest + '/res'
};
paths.img = {
  all: [paths.src + '/img/*'],
  dest: paths.dest + '/img'
};

gulp.task('clean', function() {
  del([paths.dest]);
});

gulp.task('res', function() {
  return gulp.src(paths.res.all)
      .pipe(gulp.dest(paths.res.dest));
});

gulp.task('img', function() {
  return gulp.src(paths.img.all)
      .pipe(gulp.dest(paths.img.dest));
});

gulp.task('js', function() {
  var cust = gulp.src(paths.js.cust)
      .pipe(uglify())
      .pipe(gulp.dest(paths.js.dest));
  var ext = gulp.src(paths.js.ext)
      .pipe(gulp.dest(paths.js.dest));
  return merge(cust, ext);
});

gulp.task('css', function() {
  var cust = gulp.src(paths.css.cust)
      .pipe(sass({outputStyle: 'compressed'}))
      .pipe(gulp.dest(paths.css.dest));
  var ext = gulp.src(paths.css.ext)
      .pipe(gulp.dest(paths.css.dest));
  return merge(cust, ext)
      .pipe(filter(paths.css.cat))
      .pipe(order(paths.css.cat))
      .pipe(concat('layout.css'))
      .pipe(gulp.dest(paths.css.dest));
});

gulp.task('build', ['clean', 'res', 'img', 'js', 'css']);

gulp.task('default', ['build']);
