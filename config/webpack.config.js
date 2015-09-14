
var path = require('path');
var workspaceConf = require('./workspace.config');

module.exports = {
    externals: {
        react: 'React',
        firebase: 'Firebase',
        settings: 'AppSettings'
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
        modulesDirectories: [
            'node_modules',
            path.join(__dirname, '..', 'app', 'js')
        ]
    },
    output: {
        library: workspaceConf.libraryName,
        libraryTarget: 'umd',
        filename: workspaceConf.bundleName + '.js',
        sourceMapFilename: workspaceConf.bundleName + '.map.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                include: path.join(__dirname, '..', 'app'),
                loader: [
                    'babel-loader?',
                    [
                        'optional[]=runtime',
                        'optional[]=es7.classProperties',
                        'optional[]=es7.decorators'
                    ].join('&')
                ].join('')
            }
        ]
    }
};
