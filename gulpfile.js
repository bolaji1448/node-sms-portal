'use strict';


var gulp = require('gulp'),
  exit = require('gulp-exit'),
  mocha = require('gulp-mocha'),
  shell = require('gulp-shell'),
  models = require('./server/models'),
  nodemon = require('gulp-nodemon'),
  logger = require('winston'),
  jade = require('gulp-jade'),
  less = require('gulp-less'),
  path = require('path'),
  concat = require('gulp-concat'),
  browserify = require('browserify'),
  gutil = require('gulp-util'),
  source = require('vinyl-source-stream'),
  bower = require('gulp-bower'),
  uglify = require('gulp-uglify'),
  istanbul = require('gulp-istanbul');

var paths = {
  public: 'public/**',
  jade: 'app/**/*.jade',
  styles: 'app/styles/*.+(less|css)',
  scripts: 'app/**/*.js',
  staticFiles: [
    '!app/**/*.+(less|css|js|jade)',
    'app/**/*.*'
  ],
  serverTest: './test/server/**/*.js'
};

gulp.task('coverage-setup', function () {
  return gulp.src('./server/**/*.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('db:migrate', shell.task([
  'node_modules/.bin/sequelize db:migrate'
]));

gulp.task('db:sync', function () {
  return models.sequelize.sync().then(exit());
});

gulp.task('server:test', ['db:sync', 'coverage-setup'], function () {
  process.env.NODE_ENV = 'test';
  return gulp.src(paths.serverTest)
    .pipe(mocha())
    .pipe(istanbul.writeReports({
      dir: './test/coverage'
    }));
});

gulp.task('bower', function () {
  return bower()
    .pipe(gulp.dest('public/lib/'));
});

gulp.task('nodemon', function () {
  nodemon({ script: 'server.js', ext: 'js', ignore: ['public/**', 'app/**', 'node_modules/**'] })
    .on('restart', function () {
      logger.info('>> node restart');
    });
});

gulp.task('default', ['nodemon']);
gulp.task('test', ['server:test']);
gulp.task('build', ['db:migrate', 'bower']);

gulp.task('heroku:staging', ['build']);
gulp.task('heroku:production', ['build']);
