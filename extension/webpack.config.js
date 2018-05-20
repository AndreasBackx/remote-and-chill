const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
    entry: {
        "content/netflix.js": "./src/content/netflix.js",
        "popup/main.js": "./src/popup/main.js",
    },
    output: {
        filename: "[name]",
        library: "remote-and-chill",
        libraryTarget: "umd",
    },
    watch: true,
    mode: "production",
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {
                        // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                        // the "scss" and "sass" values for the lang attribute to the right configs here.
                        // other preprocessors should work out of the box, no loader config like this necessary.
                        scss: ["vue-style-loader", "css-loader", "sass-loader"],
                        sass: [
                            "vue-style-loader",
                            "css-loader",
                            "sass-loader?indentedSyntax",
                        ],
                    },
                },
            },
            {
                test: /\.scss$/,
                use: ["vue-style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: "file-loader",
            },
            {
                test: /\.(gql|graphql)$/,
                loader: "graphql-tag/loader",
            },
        ],
    },
    resolve: {
        extensions: [".js", ".vue"],
    },
    plugins: [
        new HardSourceWebpackPlugin(),
        new VueLoaderPlugin(),
        new CleanWebpackPlugin(["dist"]),
        new CopyWebpackPlugin([
            {
                from: "./src/manifest.json",
                to: "manifest.json",
            },
            {
                from: "./src/popup/index.html",
                to: "popup/index.html",
            },
            {
                from: "./src/shared/browser-polyfill.js",
                to: "shared/browser-polyfill.js",
            },
        ]),
    ],
    stats: {
        // Disable warnings for size limits as these do not apply to extensions.
        warnings: false,
    },
};
