const webpack = require("webpack");
const MiniCssExtractPlugin = require("./node_modules/mini-css-extract-plugin");

//todo, figure out what this does
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.(ttf|eot|svg|gif|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  //confirm this is where env variables are fetched into something we can consume
  plugins: [
    new webpack.DefinePlugin({
      //add some of these to do what we want
      //api location
      $ENV: {
        apiEndpoint: JSON.stringify(process.env["MDM_UI_API_ENDPOINT"]),
      },
    }),
  ],
};
