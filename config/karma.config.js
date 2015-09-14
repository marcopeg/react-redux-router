var path = require('path');
var extend = require('extend');

var webpackConfig = extend(true, {}, require('./webpack.config.js'), {
    module: {
        postLoaders: [{
            test: /\.jsx?$/,
            exclude: /(node_modules|specs)\//,
            loader: 'istanbul-instrumenter'
        }]
    }
});

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: path.resolve(path.join(__dirname, '../')),

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['es5-shim', 'mocha', 'chai', 'sinon'],

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],

        // test results reporter to use
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [
            'progress',
            'coverage',
            'osx'
        ],

        // configure the way Karma reports the code coverage analysys
        coverageReporter: {
            reporters: [
                { type: 'html', dir: 'builds/reports' },
                { type: 'text-summary'}
            ]
        },

        // list of files / patterns to load in the browser
        // IMPORTANT: this list is automatically filled up by Workspace
        files: [
            'node_modules/react/dist/react.js',
            'app/assets/**/*.js',
            'app/**/specs/*.spec.js'
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        // IMPORTANT: this list is automatically filled up by Workspace
        preprocessors: {
            'app/**/*.spec.js': ['webpack']
        },

        webpack: webpackConfig,
        webpackServer: {
            noInfo: true
        },

        osxReporter: {
            notificationMode: 'change'
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN

    });
};
