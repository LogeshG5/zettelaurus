const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();

var argv = require('yargs/yargs')(process.argv.slice(2))
  .usage('Usage: $0 [options]')
  .example('$0 -p 8888 -r /home/user/docs', 'Start server in port 8888 with /home/user/docs as root')
  .alias('p', 'port')
  .nargs('p', 1)
  .describe('p', 'Port to listen')
  .demandOption(['p'])
  .alias('r', 'root')
  .nargs('r', 1)
  .describe('r', 'Root directory to host files')
  .demandOption(['r'])
  .help('h')
  .alias('h', 'help')
  .argv;

global.__base_dir = argv.root;
global.__port = argv.port;

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
