// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var redis = require('redis');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// DATABASE SETUP
var mongoHost = process.env.MONGO_HOST || '127.0.0.1';

var mongoose   = require('mongoose');
mongoose.connect(`mongodb://${mongoHost}/bears`); // connect to our database

// Handle the connection event
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
  console.log("DB connection alive");
});

var redisHost = process.env.REDIS_HOST || '127.0.0.1';
var redisPort = process.env.REDIS_PORT || 6379;

var redisClient = redis.createClient(redisPort, redisHost);

// Bear models lives here
var Bear = require('./models/bear');

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', (req, res) => {
    res.json({ message: 'hooray! welcome to our api!' });
});

router.route('/bears')

  // create a bear (accessed at POST http://localhost:8080/bears)
  .post(function(req, res) {

    var bear = new Bear();    // create a new instance of the Bear model
    bear.name = req.body.name;  // set the bears name (comes from the request)

    bear.save((err) => {
      if (err) {
        if (err.name === "ValidationError") {
          res.status(400).send(err);
          return;
        }

        throw err;
      }

      res.json({
        message: 'Bear successfully added',
        bear: bear
      });
    });

  })

  // get all the bears (accessed at GET http://localhost:8080/api/bears)
  .get(function(req, res) {
    var ttl = 120;

    redisClient.get(req.url, (err, bears) => {
      if (err) {
        throw err
      }
      if (!bears) {
        var page = req.query.page || 1;
        var perPage = req.query.per_page || 10;

        var filters = {};

        var skip = (page - 1) * perPage;
        if (skip < 0) {
          skip = 0;
        }

        var nameFilter = req.query.name || "";

        if (nameFilter !== "") {
          filters.name = nameFilter
        }

        Bear
        .find(filters)
        .skip(skip)
        .limit(perPage)
        .exec((err, bears) => {
          if (err) {
            throw err
          }

          redisClient.setex(req.url, ttl, JSON.stringify(bears), (err) => {
            if (err) {throw error;}
            res.json(bears);
          });
        });
      } else {
        res.json(JSON.parse(bears))
      }
    });
  });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

module.exports = app; // for testing
