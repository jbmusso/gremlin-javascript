'use strict';
var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

var buffer = require('gulp-buffer');
var uglify = require('gulp-uglify');
var size = require('gulp-size');
var rename = require('gulp-rename');
var mocha = require('gulp-mocha');
var karma = require('karma').server;
var args = require('yargs').argv;


function printError(error) {
  console.error('\nError:', error.plugin);
  console.error(error.message);
}

function printEvent(event) {
  console.log('File', event.type +':', event.path);
}


var bundler;
function getBundler() {
  if (!bundler) {
    bundler = browserify('./index.js', {
      debug: true,
      standalone: 'gremlin'
    });
  }
  return bundler;
}

gulp.task('build', function() {
  return getBundler()
    .transform(babelify)
    .bundle()
    .on('error', function(err) { console.log('Error: ' + err.message); })
    .pipe(source('./gremlin.js'))
    .pipe(gulp.dest('./'))
    .pipe(buffer())
    .pipe(size({ showFiles: true }))
    .pipe(uglify())
    .pipe(rename('gremlin.min.js'))
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest('./'));
});

gulp.task('test', ['test:node', 'test:browsers']);

gulp.task('test:node', function() {
  return gulp.src('test/**/*')
      .pipe(mocha({
        reporter: 'spec',
        bail: !!args.bail
      }))
      .on('error', printError);
});

gulp.task('test:browsers', function(done) {
  var karmaCommonConf = {
    browsers: ['Chrome', 'Firefox', 'Safari'],
    frameworks: ['mocha', 'chai', 'browserify'],
    preprocessors: {
      'test/*': ['browserify']
    },
    files: [
      'test/**/*.js'
    ],
    browserify: {
      watch: true // Watches dependencies only (Karma watches the tests)
    }
  };

  karma.start(karmaCommonConf, done);
});

gulp.task('watch', function() {
  gulp.watch(['src/**/*', 'test/**/*', 'index.js'], ['test-node'])
    .on('change', printEvent);
});

gulp.task('default', ['build']);

gulp.task('dev', ['test', 'watch']);
