'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

const externalsFolder = "external";

const copyStaticFilesSubtask = build.subTask('copy-static-files', function (gulp, buildOptions, done) {
  this.log('Copying static files...');

  gulp.src(`../${externalsFolder}/dist/*.{png,jpg,svg,gif,woff,eot,ttf}`)
  .pipe(gulp.dest("./dist"))
  .pipe(gulp.dest("./temp/deploy"));

  done();
});

build.rig.addPostBuildTask(copyStaticFilesSubtask);



function triggerTargetWebPartReload() {
    return src('../spfx/src/index.ts')
        .pipe(dest('../spfx/src/'))
}

exports.watch = function () {
    watch('../spfx/src/webparts/**/loc/*.d.ts', {
        ignoreInitial: false
    }, copyLocalizedResources);

    watch('./dist/*.js', triggerTargetWebPartReload);
}



build.initialize(gulp);
//build.initialize(require('gulp'));
