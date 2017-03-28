const gulp = require('gulp');
const babili = require('gulp-babili');
const del = require('del');
const zip = require('gulp-zip');
const lambda = require('gulp-awslambda')

gulp.task('clean', function() {
  return del(['./build', './package']);
});

gulp.task('minify', ['clean'], function() {
  return gulp.src('./lambda/*.js')
    .pipe(babili())
    .pipe(gulp.dest('./build'))
});

gulp.task('move_modules', ['clean'], function() {
  return gulp.src('./lambda/node_modules/**')
  .pipe(gulp.dest('./build/node_modules/'))
});

gulp.task('zip', ['move_modules', 'minify'], function() {
  return gulp.src('./build/**')
  .pipe(zip('lambda.zip'))
  .pipe(gulp.dest('./package/'))
});

gulp.task('upload', ['zip'], function() {
  return gulp.src('./package/lambda.zip')
  .pipe(lambda('RoomFinder', {region:'eu-west-1'}))
});

gulp.task('default', ['upload']);
