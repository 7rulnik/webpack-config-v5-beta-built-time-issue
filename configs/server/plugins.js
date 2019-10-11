const webpack = require('webpack');

const { removeEmpty, ifHot, ifProd, lazyIfHot } = require('../shared/env');

const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const StartServerPlugin = require('start-server-webpack-plugin');
const SentryPlugin = require('@sentry/webpack-plugin');

module.exports = removeEmpty([
    lazyIfHot(
        () =>
            new StartServerPlugin({
                name: 'server.js',
                signal: true,
                keyboard: true
            })
    ),

    new webpack.EnvironmentPlugin({
        NODE_ENV: null,
        HOT: null,
        TARGET: 'node'
    }),

    ifProd(
        new DuplicatePackageCheckerPlugin({
            verbose: true
        })
    ),

    ifHot(new webpack.HotModuleReplacementPlugin()),

    // TODO (@7rulnik): https://github.com/getsentry/sentry-webpack-plugin/issues/138 может понадобиться.
    // Надо половить ошибки и посмотреть что выйдет
    process.env.CI &&
        process.env.CI_COMMIT_TAG &&
        ifProd(
            new SentryPlugin({
                release: process.env.CI_COMMIT_TAG,
                include: './dist/server'
            })
        )
]);
