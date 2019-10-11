const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const transformMocksJsx = require('../../../src/mocks/babel/plugin-transform-mocks-jsx');
const transformMocksJsxSource = require('../../../src/mocks/babel/plugin-transform-mocks-jsx-source');
const transformGroupPropsByGeo = require('../../../src/mocks/babel/plugin-transform-group-props-by-geo');
const mocksOpts = require('../../../src/mocks/settings');

const plugins = require('./plugins');

const { ifDev, isDev, isProd, isHot } = require('../shared/env');

const cacheDirectory = ifDev(
    path.resolve(process.cwd(), 'node_modules/.cache/babel-loader/client'),
    false
);

const babelPresetEnv = [
    '@babel/preset-env',
    {
        useBuiltIns: 'usage',
        corejs: 3,
        modules: false,
        exclude: ['transform-typeof-symbol']
    }
];

module.exports = {
    name: 'client',
    target: 'web',
    cache: isHot,

    mode: ifDev('development', 'production'),

    devtool: ifDev('eval', 'source-map'),

    entry: {
        main: [
            // publicPath runtime setter
            './src/client/runtime.js',

            // entry point
            './src/client/index.jsx'
        ]
    },

    devServer: {
        // stats, quiet, clientLogLevel, noInfo, headers
        disableHostCheck: true,
        historyApiFallback: true,
        hot: true,
        hotOnly: true,
        overlay: true,
        publicPath: process.env.PUBLIC_PATH,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        watchOptions: {
            // ignored, info-verbosity
        },
        port: 3001,
        sockPort: 3001,
        stats: 'errors-warnings'
    },

    resolve: {
        modules: ['node_modules'],
        descriptionFiles: ['package.json'],
        extensions: ['.js', '.mjs', '.jsx', '.json'],
        alias: {
            '~': path.resolve(process.cwd(), 'src'),
            'react-dom': '@hot-loader/react-dom'
        }
    },

    output: {
        path: path.resolve(process.cwd(), 'dist/client/'),
        filename: ifDev('[name].js', '[name].[chunkhash:16].js'),
        chunkFilename: ifDev('[name].chunk.js', '[id].[chunkhash:16].js'),
        pathinfo: isDev
    },

    optimization: {
        minimize: isProd,
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                // TODO(denisx,pavelozavr): Собираем все стили в один файл, иначе они развалятся, тк в css мы ошиблись с весами
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true
                }
            }
        }
    },

    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx)$/,

                exclude: [
                    /node_modules\/(core-js|webpack|regenerator-runtime|css-loader|object-assign|@babel\/runtime)/,
                    path.resolve(process.cwd(), 'src/mocks')
                ],

                include: [
                    path.resolve(process.cwd(), 'src'),
                    path.resolve(process.cwd(), 'node_modules')
                ],

                loader: 'babel-loader',
                // Ориентриуемся на https://github.com/facebook/create-react-app/blob/master/packages/babel-preset-react-app/create.js
                options: {
                    cacheDirectory,
                    cacheCompression: false,
                    babelrc: false,
                    sourceType: 'unambiguous',
                    presets: [
                        babelPresetEnv,
                        [
                            '@babel/preset-react',
                            {
                                development: isDev,
                                useBuiltIns: true
                            }
                        ]
                    ],
                    plugins: [
                        [
                            '@babel/plugin-transform-destructuring',
                            {
                                loose: false,
                                selectiveLoose: [
                                    'useState',
                                    'useEffect',
                                    'useContext',
                                    'useReducer',
                                    'useCallback',
                                    'useMemo',
                                    'useRef',
                                    'useImperativeHandle',
                                    'useLayoutEffect',
                                    'useDebugValue'
                                ]
                            }
                        ],
                        [
                            '@babel/plugin-proposal-class-properties',
                            {
                                loose: true
                            }
                        ],
                        [
                            '@babel/plugin-proposal-object-rest-spread',
                            {
                                useBuiltIns: true
                            }
                        ],
                        '@babel/plugin-syntax-dynamic-import',
                        '@loadable/babel-plugin',
                        'babel-plugin-lodash'
                    ],
                    env: {
                        development: {
                            plugins: ['react-hot-loader/babel']
                        },
                        production: {
                            plugins: [
                                [
                                    'babel-plugin-transform-react-remove-prop-types',
                                    {
                                        removeImport: true
                                    }
                                ]
                            ]
                        }
                    }
                }
            },
            {
                test: /\.(js|mjs|jsx)$/,
                include: path.join(process.cwd(), 'src/mocks'),
                loader: 'babel-loader',
                options: {
                    cacheDirectory,
                    cacheCompression: false,
                    babelrc: false,
                    presets: [babelPresetEnv],
                    plugins: [[transformGroupPropsByGeo, mocksOpts], transformMocksJsx],
                    env: {
                        development: {
                            plugins: [transformMocksJsxSource]
                        }
                    }
                }
            },
            {
                test: /\.css$/,
                include: [
                    path.resolve(process.cwd(), 'node_modules/@alfabank/'),
                    path.resolve(process.cwd(), 'src/')
                ],
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: isHot
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            sourceMap: true,
                            modules: {
                                localIdentName: ifDev('[local]__[hash:base64:5]', '[hash:base64:8]')
                            },
                            localsConvention: 'camelCase'
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                            plugins: () => [
                                require('postcss-import')({
                                    path: 'src/'
                                }),
                                require('postcss-preset-env')({
                                    overrideBrowserslist: '> 0.5%, not dead, not OperaMini all',
                                    insertAfter: {
                                        'custom-properties': require('postcss-color-function')
                                    },
                                    preserve: false,
                                    features: {
                                        'nesting-rules': true
                                    }
                                })
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.(gif|png|jpe?g|webp|woff2?|ttf|eot|svg)$/,
                loader: 'url-loader',
                options: {
                    limit: 10240,
                    fallback: 'file-loader'
                }
            }
        ]
    },

    plugins
};
