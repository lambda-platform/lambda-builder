const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

module.exports = {
    pages: {
        index: {
            entry: 'src/index.js'
        }
    },
    productionSourceMap: false,
    configureWebpack: config => {
        config.plugins = config.plugins || []
        config.plugins.push(
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
        )
        if (process.env.NODE_ENV === 'production') {
            config.optimization = config.optimization || {}
            config.optimization.minimizer = [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            pure_funcs: ['console.log']
                        },
                        output: {
                            comments: false
                        }
                    },
                    extractComments: false
                })
            ]
        }
    },
    chainWebpack: config => {
        config.optimization.splitChunks({
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 20000,
            cacheGroups: {
                agGrid: {
                    test: /[\\/]node_modules[\\/]ag-grid/,
                    name: 'chunk-aggrid',
                    priority: 30,
                    chunks: 'all'
                },
                firebase: {
                    test: /[\\/]node_modules[\\/](@firebase|firebase)/,
                    name: 'chunk-firebase',
                    priority: 30,
                    chunks: 'all'
                },
                maps: {
                    test: /[\\/]node_modules[\\/](leaflet|esri-leaflet|leaflet-draw|leaflet\.fullscreen|turf|wkx)/,
                    name: 'chunk-maps',
                    priority: 30,
                    chunks: 'all'
                },
                editors: {
                    test: /[\\/]node_modules[\\/](@ckeditor|ckeditor5-custom-build|@tinymce|tinymce)/,
                    name: 'chunk-editors',
                    priority: 30,
                    chunks: 'all'
                },
                iview: {
                    test: /[\\/]node_modules[\\/]iview/,
                    name: 'chunk-iview',
                    priority: 25,
                    chunks: 'all'
                },
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'chunk-vendors',
                    priority: 10,
                    chunks: 'all'
                }
            }
        })
    }
}
