
module.exports = {
    bundleName: 'mobile2scale',
    libraryName: 'mobile2scale',
    build: {
        isomorphic: false,
        server: {
            compressionLevel: 0,
        },
        libs: [
            'node_modules/react/dist/react-with-addons.js'
        ]
    },
    release: {
        isomorphic: true,
        server: {
            compressionLevel: 9,
        },
        webpack: {
            dedupe: true,
            uglify: true,
            debug: false
        },
        inline: {
            css: true,
            js: true,
            libs: true,
            assets: true
        },
        libs: [
            'node_modules/react/dist/react-with-addons.min.js'
        ],
        assets: [
            'node_modules/bootstrap/fonts'
        ]
    }
};
