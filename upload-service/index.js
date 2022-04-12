const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();

global.__base_dir = '/home/gol2cob/gitp/docusaurus_wiki/docs/'
global.__port = 8888;

var corsConfig = {
  origin: "http://localhost:3000"
};

app.use(cors(corsConfig));
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.raw());
const evokeRoutes = require("./routes/upload.route");

app.use(express.urlencoded({
  extended: true
}));

evokeRoutes(app);

const port = process.env.PORT || __port;
app.listen(port, () => {
  console.log('Connected to port ' + port)
})

// Handle error
app.use((req, res, next) => {
  setImmediate(() => {
    next(new Error('Error occured'));
  });
});

app.use(function(err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});
