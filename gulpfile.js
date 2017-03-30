const gulp = require('gulp');
const babili = require('gulp-babili');
const del = require('del');
const zip = require('gulp-zip');
const lambda = require('gulp-awslambda');

gulp.task('clean', function clean() {
  return del(['./build']);
});

gulp.task('minify', ['clean'], function minify() {
  return gulp.src('./lambda/*.js')
    .pipe(babili())
    .pipe(gulp.dest('./build'));
});

gulp.task('moveModules', ['clean'], function moveModules() {
  return gulp.src('./lambda/node_modules/**')
  .pipe(gulp.dest('./build/node_modules/'));
});

gulp.task('makeZip', ['moveModules', 'minify'], function makeZip() {
  return gulp.src('./build/**')
  .pipe(zip('lambda.zip'))
  .pipe(gulp.dest('./build/package/'));
});

gulp.task('upload', ['makeZip'], function upload() {
  return gulp.src('./build/package/lambda.zip')
  .pipe(lambda('RoomFinder', { region: 'eu-west-1' }));
});

gulp.task('default', ['upload']);
