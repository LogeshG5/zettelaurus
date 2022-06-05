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

// whitelist Docusaurus live, prod & editor urls
var whitelist = ['http://localhost:3000', 'http://localhost:8585', 'http://localhost:8889'];
var corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};

app.use(cors(corsOptions));
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
