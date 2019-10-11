const path = require('path');
const nodeExternals = require('webpack-node-externals');

const transformMocksJsx = require('../../../src/mocks/babel/plugin-transform-mocks-jsx');
const transformMocksJsxSource = require('../../../src/mocks/babel/plugin-transform-mocks-jsx-source');
const transformGroupPropsByGeo = require('../../../src/mocks/babel/plugin-transform-group-props-by-geo');
const mocksOpts = require('../../../src/mocks/settings');
const plugins = require('./plugins');

const { removeEmpty, ifDev, isHot, ifHot, isDev, isProd } = require('../shared/env');

const cacheDirectory = ifDev(
    path.resolve(process.cwd(), 'node_modules/.cache/babel-loader/server'),
    false
);

const babelPresetEnv = [
    '@babel/preset-env',
    {
        useBuiltIns: 'usage',
        modules: false,
        corejs: 3,
        targets: {
            node: true
        }
    }
];

module.exports = {
    name: 'server',
    target: 'node',
    cache: isHot,

    mode: ifDev('development', 'production'),

    devtool: ifDev('eval', 'source-map'),

    entry: {
        server: removeEmpty([
            ifHot('webpack/hot/signal'),
            './src/isomorphic-env/runtime',
            './src/server/index.js'
        ])
    },

    watch: isHot,

    watchOptions: {
    },

    resolve: {
        modules: ['node_modules'],
        descriptionFiles: ['package.json'],
        extensions: ['.js', '.mjs', '.jsx', '.json'],
        alias: {
            '~': path.resolve(process.cwd(), 'src')
        }
    },

    externals: [
        ifDev(
            nodeExternals({
                whitelist: ['webpack/hot/signal', /^@alfabank/]
            }),
            ''
        )
    ],

    output: {
        path: path.resolve(process.cwd(), 'dist/server/'),
        filename: '[name].js',
        pathinfo: isDev
    },

    optimization: {
        chunkIds: 'named',
        minimize: isProd
    },

    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx)$/,
                exclude: [
                    path.resolve(process.cwd(), 'node_modules'),
                    path.resolve(process.cwd(), 'src/mocks')
                ],
                include: path.join(process.cwd(), 'src'),
                loader: 'babel-loader',
                options: {
                    cacheDirectory,
                    cacheCompression: false,
                    babelrc: false,
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
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            sourceMap: true,
                            modules: true,
                            modules: {
                                localIdentName: ifDev('[local]__[hash:base64:5]', '[hash:base64:8]')
                            },
                            localsConvention: 'camelCase',
                            onlyLocals: true
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
