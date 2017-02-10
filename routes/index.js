var express = require('express');
var router = express.Router();
var Twit = require('twit');

/* GET home page. */
router.get('/', function(req, res, next) {

  var T = new Twit({
    consumer_key:         process.env.TWITTER_API_KEY,
    consumer_secret:      process.env.TWITTER_API_SECRET,
    access_token:         process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  })

  T.get('statuses/home_timeline', {count: 20})
  .then(function(result) {
    var filtered_tweets = result.data.filter((i) => {
      return i.extended_entities ? true : false;
    })

    for(var i = 0; i < filtered_tweets.length; i++) {
      filtered_tweets[i].annotations = [];
    }

    res.render('index', { title: 'Express', tweets: filtered_tweets });
  })
  .catch(function(err) {
    res.render('index', { title: 'Express', tweets: [] });
  })

});

module.exports = router;
