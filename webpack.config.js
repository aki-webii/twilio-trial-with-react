const path = require("path");
const Dotenv = require("dotenv-webpack");

let mode = "development";
if (process.env.NODE_ENV === "production") {
  mode = "production";
}

module.exports = {
  mode,
  entry: { bundle: "./src/index.tsx" },
  output: {
    path: path.resolve(__dirname, "public"),
    publicPath: "/",
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  plugins: [new Dotenv()],
  devServer: {
    contentBase: path.resolve(__dirname, "public"),
    port: 8080,
    historyApiFallback: {
      disableDotRule: true
    }
  }
};
