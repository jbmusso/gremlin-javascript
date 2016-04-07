var path = require('path');
module.exports = function (config) {
    config.set({

        basePath: '.',

        frameworks: ['mocha', 'chai', 'sinon'],
        singleRun: true, //just run once by default

        files: [
            'tests.webpack.js', //just load this file instead of individual test files. It will fetch the proper content
        ],
        preprocessors: {
            'tests.webpack.js': [ 'webpack', 'sourcemap'] //preprocess with webpack and our sourcemap loader
        },

        //~ babelPreprocessor: {
            //~ "plugins": [
            //~ "transform-runtime",
            //~ ["transform-async-to-module-method", {
              //~ "module": "bluebird",
              //~ "method": "coroutine"
            //~ }]
          //~ ]
        //~ },

        webpack: { //kind of a copy of your webpack config
            debug:true,
            devtool: 'inline-source-map', //just do inline source maps instead of the default
            output: {
                library: 'gremlin',
                libraryTarget: 'umd'
            },
            module: {
                preLoaders: [
                    // instrument only testing sources with Istanbul
                    {
                        test: /\.js$/,
                        include: path.resolve('src/'),
                        loader: 'isparta'
                    }
                ],
                loaders: [
                    { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
                ]
            }
        },

        reporters: ['mocha', 'coverage', 'coveralls'],

        coverageReporter: {
            type: 'lcov', // lcov or lcovonly are required for generating lcov.info files
            dir: 'coverage/'
        },

        port: 9876,
        colors: true,
        autoWatch: false,
        singleRun: false,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        browsers: ['Firefox'],
        plugins: [
            'karma-firefox-launcher',
            'karma-mocha',
            'karma-chai',
            'karma-webpack',
            'karma-sourcemap-loader',
            'karma-mocha-reporter',
            'karma-coverage',
            'karma-coveralls',
            'karma-sinon'
        ]

    });
};
