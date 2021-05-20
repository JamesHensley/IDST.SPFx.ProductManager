const { src, dest, watch } = require('gulp');

function copyLocalizedResources() {
    return src('../spfx/src/webparts/**/loc/*.d.ts')
        .pipe(dest('./src/webparts'));
}
