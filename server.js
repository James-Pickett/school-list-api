const express = require('express'); // Express JS Framework
const mongoose = require('mongoose'); // mongoose ORM
const bodyParser = require('body-parser'); // json body-parser
const fs = require('fs'); // file stream
const indexRoute = require('./api/index.route'); // api index routes file
const morgan = require('morgan');
const config = require('config');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.text());
app.use('/api/v1', indexRoute); // default route to read index routes

let dbUrl = '';

if (fs.existsSync('./config')) { // check to see if we have a config folder
  let rawData = fs.readFileSync('./config/dev.json'); // load up the dev json
  if (config.util.getEnv('NODE_ENV') === 'test') { // the we are in the test enviornment
    rawData = fs.readFileSync('./config/test.json'); // load up the test json
  } else {
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGS
    console.log('Using morgan \'combined\' logs');
  }
  dbUrl = JSON.parse(rawData).DBHost;
  console.log('Using local config');
} else {
  dbUrl = process.env.MONGODB_URI;
}

mongoose.connect(dbUrl);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const server = app.listen(process.env.PORT || 8080, () => {
  const port = server.address().port;
  console.log('App now running on port', port);
});

module.exports = app; // for testing
