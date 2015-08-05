var gulp = require("gulp");
var gutil = require("gutil");
var glob = require("glob");
var browserify = require("browserify");
var watchify = require("watchify");
var tsify = require("tsify");
var _ = require('lodash');
var source = require('vinyl-source-stream');
var spawn = require('child_process').spawn;
var express = require('express');

var config = {
    server: {
        test: {
            port: 3000,
            rootPath: 'dev/htdocs'
        }
    },
    glob: {
        test: {
            src: 'test/**/*.test.ts',
            dest: 'dev/htdocs'
        }
    }
};
function startStaticServer(path, port) {
    var app = express();
    app.use(express.static(path));
    var server = app.listen(port, function () {
        var port = server.address().port;
        console.log('Serve static folder `dev/htdocs` on http://localhost:' + port);
    });
    return server;
}
function startTestStaticServer() {
    return startStaticServer(config.server.test.rootPath, config.server.test.port);
}
function createBrowserifyBundle(files) {
    var options = _.assign(watchify.args, {
        extensions: ['.ts'],
        debug: true
    });
    return browserify(files, options).plugin(tsify, { module: 'commonjs' });
}
function compileTests(b) {
    return b.bundle()
        .pipe(source('tests.js'))
        .pipe(gulp.dest(config.glob.test.dest));
}
function mocha() {
    url = 'http://localhost:' + config.server.test.port + '/index.html';
    var proc = spawn('mocha-phantomjs', [
        '-s', 'localToRemoteUrlAccessEnabled=true',
        '-s', 'webSecurityEnabled=false',
        url
    ]);
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
    return proc;
}
gulp.task('test', function () {
    var server = startTestStaticServer();
    glob(config.glob.test.src, function (error, files) {
        compileTests(createBrowserifyBundle(files)).on('end', function () {
            mocha().on('close', function () {
                server.close();
            });
        });
    });
});
gulp.task('test:watch', function () {
    startTestStaticServer();
    glob(config.glob.test.src, function (error, files) {
        var b = watchify(createBrowserifyBundle(files));
        b.on('update', rebundle);
        b.on('log', gutil.log);
        rebundle();
        function rebundle() {
            console.log('Compiling tests ...');
            compileTests(b).on('end', mocha);
        }
    });
});
