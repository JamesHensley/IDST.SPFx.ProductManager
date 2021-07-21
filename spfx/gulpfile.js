'use strict';

const gulp = require('gulp');

const build = require('@microsoft/sp-build-web');
build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);
build.tslint.enabled = false;

const externalsFolder = "external";
const copyStaticFilesSubtask = build.subTask('copy-static-files', function (gulp, buildOptions, done) {
  gulp.src(`../${externalsFolder}/dist/*.{png,jpg,svg,gif,woff,eot,ttf,json}`)
  .pipe(gulp.dest("./dist"))
  .pipe(gulp.dest("./temp/deploy"));
  gulp.src(`../${externalsFolder}/src/assets/*.{png,jpg,svg,gif,woff,eot,ttf,json}`)
  .pipe(gulp.dest("./dist"))
  .pipe(gulp.dest("./temp/deploy"));
  done();
});

// Uncomment the line below if you're using SPFx v1.4 or higher to copy static assets
//   into the SPPKG; versions below 1.4 will not support embedded assets (ie: SP2016)
build.rig.addPostBuildTask(copyStaticFilesSubtask);

build.initialize(gulp);
