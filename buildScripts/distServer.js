var express = require("express");
var path = require("path");
var open = require("open");
import compression from "compression";

var port = 3001;

var app = express();

app.use(compression());
app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(port, (err) => {
  if (err) return;

  open("http://localhost:" + port);
});
