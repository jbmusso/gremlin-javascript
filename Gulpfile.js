var gulp = require('gulp');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var size = require('gulp-size');
var rename = require('gulp-rename');
var mocha = require('gulp-mocha');


function printError(error) {
  console.error('\nError:', error.plugin);
  console.error(error.message);
}

function printEvent(event) {
  console.log('File', event.type +':', event.path);
}


gulp.task('build', function() {
  gulp.src('index.js')
      .pipe(browserify({
        debug: true,
        standalone: 'gremlin'
      }))
      .pipe(rename('gremlin.js'))
      .pipe(gulp.dest('./'))
      .pipe(size({ showFiles: true }))
      // Minified version
      .pipe(uglify())
      .pipe(rename('gremlin.min.js'))
      .pipe(gulp.dest('./'))
      .pipe(size({ showFiles: true }));
});

gulp.task('test', function() {
  require('should');

  gulp.src('test/**/*')
      .pipe(mocha({
        reporter: 'spec',
      }))
      .on('error', printError);
});

gulp.task('watch', function() {
  gulp.watch(['src/**/*', 'test/**/*', 'index.js'], ['test']).on('change', printEvent);
});

gulp.task('default', ['build']);

gulp.task('dev', ['test', 'watch']);
