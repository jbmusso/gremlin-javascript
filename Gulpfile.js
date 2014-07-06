var gulp = require('gulp');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var size = require('gulp-size');
var rename = require('gulp-rename');


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

gulp.task('default', ['build']);