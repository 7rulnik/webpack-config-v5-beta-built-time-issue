const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BrotliPlugin = require('brotli-webpack-plugin');
const CssoWebpackPlugin = require('csso-webpack-plugin').default;
const LoadablePlugin = require('@loadable/webpack-plugin');
const SentryPlugin = require('@sentry/webpack-plugin');

const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
// const { UnusedFilesWebpackPlugin } = require('unused-files-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const IsomorphicEnvClientPlugin = require('../../../src/isomorphic-env/client-plugin');

const { createIf } = require('../shared/utils');

const ifAnalyze = createIf(!!process.env.ANALYZE);

const { removeEmpty, ifDev, isProd, ifProd, isHot, ifHot } = require('../shared/env');

module.exports = removeEmpty([
    new MiniCssExtractPlugin({
        filename: ifDev('[name].css', '[name].[contenthash:16].css'),
        chunkFilename: ifDev('[name].chunk.css', '[id].[contenthash:16].css'),
        ignoreOrder: true,
    }),

    new LoadablePlugin({
        writeToDisk: {
            filename: './src/server/data'
        }
    }),

    new webpack.EnvironmentPlugin({
        NODE_ENV: null,
        HOT: null,
        TARGET: 'web'
    }),

    new IsomorphicEnvClientPlugin(),

    ifHot(new webpack.HotModuleReplacementPlugin()),

    ifProd(new CssoWebpackPlugin()),

    ifProd(
        new CompressionPlugin({
            test: /\.js$|\.css$/,
            algorithm: 'gzip'
        })
    ),

    ifProd(
        new BrotliPlugin({
            test: /\.js$|\.css$/,
        })
    ),

    // new UnusedFilesWebpackPlugin({
    //     patterns: 'src/**/*.*',
    //     globOptions: {
    //         ignore: ['node_modules/**/*', 'src/**/__tests__/**/*', 'src/server/**/*']
    //     }
    // }),

    ifProd(
        new DuplicatePackageCheckerPlugin({
            verbose: true,
            emitError: false
        })
    ),

    ifProd(
        new webpack.optimize.LimitChunkCountPlugin({
            minChunkSize: 204800
        })
    ),

    process.env.CI &&
        process.env.CI_COMMIT_TAG &&
        ifProd(
            new SentryPlugin({
                release: process.env.CI_COMMIT_TAG,
                include: './dist/client'
            })
        ),

    ifAnalyze(
        new BundleAnalyzerPlugin({
            analyzerMode: 'static'
        })
    )
]);
