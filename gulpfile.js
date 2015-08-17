//var colors = require('colors');
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
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');

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
        },
        build: {
            src: 'src/index.ts',
            dest: 'dist'
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

function createTestBundle(files) {
    var options = _.assign(watchify.args, {
        extensions: ['.ts'],
        debug: true
    });
    return browserify(files, options).plugin(tsify, { module: 'commonjs' });
}

function compileTests(b) {
    return b.bundle()
        .on('error', function(e) {
            console.error('Browserify error:'.red, e.message);
        })
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
        compileTests(createTestBundle(files)).on('end', function () {
            mocha().on('close', function () {
                server.close();
            });
        })
    });
});

gulp.task('test:watch', function () {
    startTestStaticServer();
    glob(config.glob.test.src, function (error, files) {
        var b = watchify(createTestBundle(files));
        b.on('update', rebundle);
        b.on('log', gutil.log);
        rebundle();
        function rebundle() {
            console.log('Compiling tests ...');
            compileTests(b).on('end', mocha);
        }
    });
});

gulp.task('clean', function() {
    gulp.src([
        'src/**/*.js',
        'src/**/*.js.map',
        'test/**/*.js',
        'test/**/*.js.map'
    ]).pipe(clean());
});

gulp.task('build', function(done) {
    var options = _.assign({
        extensions: ['.ts'],
        debug: false,
        detectGlobals: false,
        standalone: "di"
    });
    var b = browserify(config.glob.build.src, options).plugin(tsify, { module: 'commonjs' });
    b.bundle()
        .on('error', function(e) {
            console.error('Browserify error:'.red, e.message);
        })
        .pipe(source('di.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest(config.glob.build.dest))
        .on('end', function() {
            done();
        });
});