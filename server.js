var say = require('say'),
    FeedParser = require('feedparser'),
    request = require('request'),
    htmlToText = require('html-to-text'),
    async = require('async');

var FEED_URL = process.env.FEED_URL;
if (FEED_URL == undefined) {
    FEED_URL = "http://feeds.bbci.co.uk/news/world/rss.xml"
}

// Store feed texts to speak
var texts = [];

//
// Get feed, and store it in `texts`
//
var req = request(FEED_URL),
    feedparser = new FeedParser();

req.on('error', function (error) {
    // handle any request errors
});
req.on('response', function (res) {
    var stream = this;

    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

    stream.pipe(feedparser);
});

feedparser.on('error', function(error) {
    // always handle errors
});
feedparser.on('readable', function() {
    // This is where the action is!
    var stream = this
    , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
    , item;

    while (item = stream.read()) {
	// console.log(item);
    	// console.log(item.description);
	var text = htmlToText.fromString(item.description);
	// console.log(text);
	texts.push(text);
    }
});
// Fired when finished processing stream
feedparser.on('end', () => {
    console.log('There will be no more data.');
    async.eachSeries(texts, speakout, function(err) { if (err) {console.log(err);} });
});

//
// Do the actual speak
//
var speakout = function(text, callback) {
    console.log("SPEAK => " + text);

    // Festival cannot handle quite marks, clean it
    var textcleaned = text.replace(/["]/gi, '')
    // There are a lot of things that `festival` cannot pronounce,
    // so might need to be more careful about what to pass it through `say`.
    // Find which voices are available by running `festival`, and starting
    // at `(voice_` press TAB to see what is available on the system.
    say.speak(textcleaned, 'voice_ked_diphone', 1.0, function(err) {
	if (err) {
	    return console.error(err);
	    callback(err);
	}
	console.log('Text has been spoken.');
	callback();
    });
};
