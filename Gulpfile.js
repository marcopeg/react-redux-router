var path = require('path');
var pkg = require('./package.json');

var path = require('path');
var stream = require('stream');
var extend = require('extend');
var webpack = require('webpack');
var hogan = require('hogan.js');
var notifier = require('node-notifier');
var karma = require('karma');
var fs = require('fs-extra');
var del = require('del');

var gulp = require('gulp');
var gulpIf = require('gulp-if');
var gulpWebpack = require('webpack-stream');
var gulpLess = require('gulp-less');
var gulpRename = require('gulp-rename');
var gulpSourcemaps = require('gulp-sourcemaps');
var gulpCssBase64 = require('gulp-css-base64');
var gulpInlineSource = require('gulp-inline-source');
var gulpLesshint = require('gulp-lesshint');
var gulpLesshintStylish = require('gulp-lesshint-stylish');
var gulpJsxcs = require('gulp-jsxcs');
var gulpWatch = require('gulp-watch');

var LessPluginCleanCSS = require('less-plugin-clean-css');
var cleanCss = new LessPluginCleanCSS({ advanced: true });

var webpackConfig = require('./config/webpack.config');
var lessConf = require('./config/less.config');
var jscsConf = require('./config/jscs.config');

var noop = function() {};

var workspaceConf = require('./lib/workspace-conf');
var appConf = require('./lib/app-conf');
var jscsExplainError = require('./lib/jscs-explain-error');
var getInitialState = require('./app/get-initial-state.iso');

var JS2LINT = [
    path.join(__dirname, './app/*.js'),
    path.join(__dirname, './app/js/**/*.js'),
    path.join(__dirname, './app/js/**/*.jsx')
];

var JS2LINT_ALL = [
    path.join(__dirname, './*.js'),
    path.join(__dirname, './lib/**/*.js'),
    path.join(__dirname, './config/**/*.js')
].concat(JS2LINT);

var LESS2LINT = [
    path.join(__dirname, './app/**/*.less')
];

gulp.task('lint-js', function() {
    return gulp.src(JS2LINT)
        .pipe(gulpJsxcs(jscsConf))
        .on('error', noop)
        .pipe(notifyJscs());
});

gulp.task('lint-all-js', function() {
    return gulp.src(JS2LINT_ALL)
        .pipe(gulpJsxcs(jscsConf))
        .on('error', noop)
        .pipe(notifyJscs());
});

gulp.task('build-js', function() {
    var conf = extend(true, {}, webpackConfig, {
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify('development')
                }
            })
        ],
        devtool: 'source-map',
        debug: true
    });
    return gulp.src([
        path.join(__dirname, './app/*.js'),
        '!' + path.join(__dirname, './app/*.iso.js')
    ])
        .pipe(gulpWebpack(conf))
        .pipe(gulp.dest(path.join(__dirname, 'builds/develop')));
});

gulp.task('release-js', function() {
    var plugins = [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
    ];

    if (workspaceConf.release.webpack.dedupe) {
        plugins.push(new webpack.optimize.DedupePlugin());
    }

    if (workspaceConf.release.webpack.uglify) {
        plugins.push(new webpack.optimize.UglifyJsPlugin());
    }

    var conf = extend(true, {}, webpackConfig, {
        plugins: plugins,
        debug: workspaceConf.release.webpack.debug
    });

    return gulp.src([
        path.join(__dirname, './app/*.js'),
        '!' + path.join(__dirname, './app/*.iso.js')
    ])
        .pipe(gulpWebpack(conf))
        .pipe(gulpRename(function(path) {
            path.basename = workspaceConf.bundleName + '_' + pkg.version;
        }))
        .pipe(gulp.dest(path.join(__dirname, 'builds/release')));
});

gulp.task('build-assets', function() {
    return gulp.src([
        path.join(__dirname, 'node_modules', 'bootstrap', '**', 'fonts', '**/*'),
        '!' + path.join(__dirname, 'node_modules', 'bootstrap', 'dist', '**', 'fonts', '**/*'),
        path.join(__dirname, 'app', 'assets', '**/*')
    ])
        .pipe(gulp.dest(path.join(__dirname, 'builds/develop/assets')));
});

gulp.task('clear-release', function(done) {
    del([path.join(__dirname, 'builds/release/**/*')], {
        force: true
    }, done);
});

gulp.task('release-assets', function() {
    return gulp.src([
        path.join(__dirname, 'app', 'assets', '**/*')
    ])
        .pipe(gulp.dest(path.join(__dirname, 'builds/release/assets')));
});

gulp.task('lint-less', function() {
    return gulp.src(LESS2LINT)
        .pipe(gulpLesshint())
        .on('error', noop)
        .pipe(notifyLesshint())
        .pipe(gulpLesshintStylish());
});

gulp.task('build-less', ['build-assets'], function() {
    var conf = extend(true, {}, lessConf, {

    });
    return gulp.src(path.join(__dirname, './app/*.less'))
        .pipe(gulpRename(function(path) {
            path.basename = workspaceConf.bundleName;
        }))
        .pipe(gulpSourcemaps.init())
        .pipe(gulpLess(conf))
        .pipe(gulpSourcemaps.write('./'))
        .pipe(gulp.dest(path.join(__dirname, 'builds/develop')));
});

gulp.task('release-less', ['release-assets'], function() {
    var conf = extend(true, {}, lessConf, {
        plugins: [cleanCss]
    });
    return gulp.src(path.join(__dirname, './app/*.less'))
        .pipe(gulpLess(conf))
        .pipe(gulpRename(function(path) {
            path.basename = workspaceConf.bundleName + '_' + pkg.version;
        }))
        .pipe(gulpIf(workspaceConf.release.inline.assets, gulpCssBase64({
            baseDir: '../node_modules'
        })))
        .pipe(gulp.dest(path.join(__dirname, 'builds/release')));
});

gulp.task('build-html', ['build-js'], function() {
    return gulp.src(path.join(__dirname, './app/*.html'))
        .pipe(html4develop())
        .pipe(gulp.dest(path.join(__dirname, 'builds/develop')));
});

gulp.task('release-html', ['release-less', 'release-js'], function() {
    return gulp.src(path.join(__dirname, './app/*.html'))
        .pipe(html4release())
        .pipe(gulpInlineSource({
            htmlpath: path.resolve('builds/release/_'),
            compress: false
        }))
        .pipe(gulp.dest(path.join(__dirname, 'builds/release')));
});

var karmaServer;
gulp.task('start-karma', function() {
    karmaServer = new karma.Server({
        configFile: path.join(__dirname, 'config', 'karma.config.js'),
        singleRun: false,
        autoWatch: true
    });
    karmaServer.start();
});

gulp.task('run-karma', function() {
    if (karmaServer) {
        karmaServer.run();
    }
});

function html4develop() {
    var _stream = new stream.Transform({objectMode: true});
    _stream._transform = function(file, unused, callback) {
        var source = String(file.contents);
        var template = hogan.compile(source);

        var moduleName = require.resolve('./builds/develop/' + workspaceConf.bundleName);
        delete require.cache[moduleName];

        if (workspaceConf.build.isomorphic) {
            getInitialState().then(function(initialState) {
                var appBuild = require(moduleName);
                var appMarkup = appBuild.renderMarkup(initialState);
                _render(initialState, appMarkup);
            }).catch(function(err) {
                console.error('Error building app initial state:', err);
            });
        } else {
            _render({
                settings: appConf
            }, '');
        }

        function _render(initialState, appMarkup) {

            var js = ['<script src="/' + workspaceConf.bundleName + '.js"></script>'];
            workspaceConf.build.libs.forEach(function(lib) {
                lib = lib.replace('node_modules', '').replace('bower_components', '');
                js.unshift('<script src="' + lib + '"></script>');
            });

            var data = {
                firebaseUrl: appConf.firebaseUrl,
                html: appMarkup,
                cfg: JSON.stringify(initialState),
                css: '<link rel="stylesheet" href="/' + workspaceConf.bundleName + '.css" />',
                js: js.join('\n    '),
                bundleName: workspaceConf.bundleName,
                libraryName: workspaceConf.libraryName
            };

            file.contents = new Buffer(template.render(data));
            callback(null, file);
        }

    };

    return _stream;

}

// release will render an isomorphic app
function html4release() {
    var _stream = new stream.Transform({objectMode: true});
    _stream._transform = function(file, unused, callback) {
        var source = String(file.contents);
        var template = hogan.compile(source);

        if (workspaceConf.release.isomorphic) {
            getInitialState().then(function(initialState) {
                var appBuild = require('./builds/release/' + workspaceConf.bundleName + '_' + pkg.version);
                var appMarkup = appBuild.renderMarkup(initialState);
                _render(initialState, appMarkup);
            }).catch(function(err) {
                console.error('Error building app initial state:', err);
            });
        } else {
            _render({
                settings: appConf,
                events: [],
                drafts: [],
                speakers: []
            }, '');
        }

        function _render(initialState, appMarkup) {
            var inline = {
                css: workspaceConf.release.inline.css ? 'inline' : '',
                js: workspaceConf.release.inline.js ? 'inline' : '',
                libs: workspaceConf.release.inline.libs ? 'inline' : '',
                libsRelative: workspaceConf.release.inline.libs ? '../../' : './'
            };

            var js;
            if (workspaceConf.release.inline.js) {
                js = ['<script src="./' + workspaceConf.bundleName + '_' + pkg.version + '.js" ' + inline.js + '></script>'];
            } else {
                js = ['<script src="/' + workspaceConf.bundleName + '_' + pkg.version + '.js" ' + inline.js + '></script>'];
            }

            if (workspaceConf.release.inline.libs) {
                workspaceConf.release.libs.forEach(function(lib) {
                    js.unshift('<script src="../../' + lib + '" inline></script>');
                });
            } else {
                workspaceConf.release.libs.forEach(function(lib) {
                    lib = lib.replace('node_modules', '').replace('bower_components', '');
                    js.unshift('<script src="' + lib + '"></script>');
                });
            }

            var css;
            if (workspaceConf.release.inline.libs) {
                css = '<link rel="stylesheet" href="./' + workspaceConf.bundleName + '_' + pkg.version + '.css" ' + inline.css + ' />';
            } else {
                css = '<link rel="stylesheet" href="/' + workspaceConf.bundleName + '_' + pkg.version + '.css" ' + inline.css + ' />';
            }

            var data = {
                firebaseUrl: appConf.firebaseUrl,
                html: appMarkup,
                cfg: JSON.stringify(initialState),
                css: css,
                js: js.join('\n    '),
                bundleName: workspaceConf.bundleName + '_' + pkg.version,
                libraryName: workspaceConf.libraryName
            };

            file.contents = new Buffer(template.render(data));
            callback(null, file);
        }

        // copy libs into release folder
        workspaceConf.release.libs.forEach(function(lib) {
            var source = path.join(__dirname, lib);
            lib = lib.replace('node_modules', '').replace('bower_components', '');
            var dest = path.join(__dirname, 'builds', 'release', lib);
            fs.copySync(source, dest);
        });

        workspaceConf.release.assets.forEach(function(lib) {
            var source = path.join(__dirname, lib);
            lib = lib.replace('node_modules', '').replace('bower_components', '');
            var dest = path.join(__dirname, 'builds', 'release', lib);
            fs.copySync(source, dest);
        });

    };

    return _stream;
}

function notifyLesshint() {
    var _stream = new stream.Transform({objectMode: true});
    _stream._transform = function(file, unused, callback) {
        if (file.lesshint && !file.lesshint.success) {
            var fpath = file.path.split('/');

            notifier.notify({
                title: 'LessHint Says:',
                message: [fpath.pop(), fpath.pop()].reverse().join('/')
            });

            // @TODO: create a report file

        }

        callback(null, file);
    };

    return _stream;
}

function notifyJscs() {
    var _stream = new stream.Transform({objectMode: true});
    _stream._transform = function(file, unused, callback) {
        if (file.jsxcs && !file.jsxcs.success) {
            var fpath = file.path.split('/');

            // console.log(file.jsxcs);

            notifier.notify({
                title: 'JSCS Says:',
                message: [fpath.pop(), fpath.pop()].reverse().join('/')
            });

            file.jsxcs.errors.forEach(function(error) {
                console.log(jscsExplainError(error, true));
            });

            // @TODO: create a report file

        }

        callback(null, file);
    };

    return _stream;
}

gulp.task('lint', ['lint-js', 'lint-less']);
gulp.task('lint-all', ['lint-all-js', 'lint-less']);
gulp.task('build', ['build-js', 'build-less', 'build-html']);
gulp.task('release', ['clear-release', 'release-js', 'release-less', 'release-html']);

gulp.task('watch', ['build'], function() {
    gulpWatch(['./app/**/*.js', './app/**/*.jsx'], function() {
        gulp.start('build-js');
    });

    gulpWatch(['./app/**/*.less'], function() {
        gulp.start('build-less');
    });

    gulpWatch(['./app/**/*.html', './app/*.js'], function() {
        gulp.start('build-html');
    });
});

gulp.task('watch-lint', function() {
    gulpWatch(JS2LINT, function() {
        gulp.start('lint-js');
    });

    gulpWatch(LESS2LINT, function() {
        gulp.start('lint-less');
    });
});

gulp.task('start-tdd', ['start-karma'], function() {
    gulp.watch(['./app/**/*.js', './app/**/*.jsx'], function() {
        gulp.start('run-karma');
    });
});
