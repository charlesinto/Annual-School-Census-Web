var express = require("express");
import webpack from "webpack";
var path = require("path");
import config from "../webpack.config.dev";
var open = require("open");

var port = 3001;

const compiler = webpack(config);

var app = express();

app.use(
  require("webpack-dev-middleware")(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath,
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../src/index.html"));
});

app.listen(port, (err) => {
  if (err) return;

  open("http://localhost:" + port);
});
