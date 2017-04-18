const gulp = require('gulp');
const babili = require('gulp-babili');
const zip = require('gulp-zip');
const lambda = require('gulp-awslambda');
const eslint = require('gulp-eslint');
const clean = require('gulp-clean');
const shell = require('gulp-shell');
const aws = require('aws-sdk');

const params = {
  FunctionName: 'RoomFinder',
  Role: '{ARN OF ROOM_FINDER_BASIC_EXECUTION ROLE}',
  Handler: 'index.handler',
  Runtime: 'nodejs4.3',
  Description: 'Handles Room Finder Alexa Skill',
};

gulp.task('clean', function () {
  return gulp.src('./build', { read: false })
    .pipe(clean());
});

// This task requires an .eslintrc.json file.
gulp.task('lint', function lint() {
  return gulp.src(['./lambda/*.js', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format());
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

gulp.task('update', ['makeZip', 'lint'], function update() {
  return gulp.src('./build/package/lambda.zip')
  .pipe(lambda('RoomFinder', { region: 'eu-west-1' }));
});

gulp.task('create', ['makeZip', 'lint'], function create() {
  return gulp.src('./build/package/lambda.zip')
  .pipe(lambda(params, { region: 'eu-west-1' }))
  .pipe(shell('aws lambda add-permission --function-name RoomFinder --statement-id "1234" --action "lambda:InvokeFunction" --principal "alexa-appkit.amazon.com"  --region eu-west-1'));
});

gulp.task('createRole', shell.task([
  'aws iam create-role --role-name room_finder_basic_execution --assume-role-policy-document file://automation/role-policy-document.json',
  'aws iam put-role-policy --role-name room_finder_basic_execution --policy-name lambda_basic_execution --policy-document file://automation/basic-execution-role.json',
  'aws iam get-role --role-name room_finder_basic_execution',
]));

gulp.task('configure', shell.task([
  'read -p "Insert IAM ID here: " id ; aws configure set aws_access_key_id $id',
  'read -p "Insert IAM Secret Key here: " key ; aws configure set aws_secret_access_key $key',
  'aws configure set default.region eu-west-1',
]));

gulp.task('default', ['update']);
