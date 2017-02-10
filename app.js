var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('express-flash');

var webpackDevMiddleware = require('webpack-dev-middleware');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');

var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'braincandy', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true}));
app.use(flash());

app.use('/', index);

// webpack to compile react client files
var compiler = webpack(webpackConfig);
app.use(webpackDevMiddleware(compiler, {
  hot: true,
  filename: 'bundle.js',
  publicPath: '/',
  stats: {
    colors: true,
  },
  historyApiFallback: true,
}));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// start twitter stream
var Twit = require('twit');

var T = new Twit({
  consumer_key:         process.env.TWITTER_API_KEY,
  consumer_secret:      process.env.TWITTER_API_SECRET,
  access_token:         process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

var stream = T.stream('user');
var fs = require('fs');
var request = require('request');

stream.on('tweet', function (tweet) {
  if(tweet.retweeted_status) {
    return;
  }
  // see if there's embeded media
  if(tweet && tweet.extended_entities && tweet.extended_entities.media) {
    // console.log(tweet.entities.media);
    // console.log(tweet);

    if(tweet.display_text_range) {
      tweet.text = tweet.text.substring(tweet.display_text_range[0], tweet.display_text_range[1]);
    }

    if(tweet.extended_entities.media) {
      tweet.extended_entities.media = tweet.extended_entities.media.slice(0, 1);
    }

    app.socketio.to('frontends').emit('addtweet', { id_str: tweet.id_str, text: tweet.text, extended_entities: tweet.extended_entities, user: tweet.user, annotations: []});

    // download the image to google storage
    var imageurl = tweet.extended_entities.media[0].media_url;
    request(imageurl).pipe(fs.createWriteStream(path.basename(imageurl))).on('close', function() {
      var gcs = require('@google-cloud/storage')({
        projectId: process.env.GOOGLE_PROJECT_ID,
        keyFilename: process.env.GOOGLE_API_KEYFILE
      });

      var bucket = gcs.bucket('braincandy');

      bucket.upload(path.basename(imageurl), function(err, file) {
        if (!err) {
          // call the vision api
          var vision = require('@google-cloud/vision')({
            projectId: process.env.GOOGLE_PROJECT_ID,
            keyFilename: process.env.GOOGLE_API_KEYFILE
          });

          var annotateImageReq = {
            features: [ { type: "LABEL_DETECTION" } ],
            image: {
              source: {
                gcsImageUri: "gs://braincandy/" + path.basename(imageurl)
              }
            }
          }

          vision.annotate(annotateImageReq).then(function(data) {
            var annotations = data[0];
            var apiResponse = data[1];

            var labels = [];
            annotations.map((r) => {
              if(r.labelAnnotations) {
                r.labelAnnotations.map((r) => {
                  labels.push(r.description);
                });
              }
            });

            app.socketio.to('frontends').emit('addtweet', { id_str: tweet.id_str, text: tweet.text, extended_entities: tweet.extended_entities, user: tweet.user, annotations: labels});
            file.delete();
            fs.unlink(path.basename(imageurl));
          })
          .catch(function (err) {
            console.log(err);
          })
        } else {
          fs.unlink(path.basename(imageurl));
          file.delete();
        }
      });
    });
  }
})


module.exports = app;
