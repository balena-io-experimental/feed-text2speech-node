var say = require('say'),
    FeedParser = require('feedparser'),
    request = require('request'),
    htmlToText = require('html-to-text'),
    async = require('async'),
    moment = require('moment');

// Feed URL to pull items from
var FEED_URL = process.env.FEED_URL;
if (FEED_URL == undefined) {
    FEED_URL = "http://feeds.bbci.co.uk/news/world/rss.xml"
}

// How often to check feed
var RECHECK_PERIOD = process.env.RECHECK_PERIOD;
if (RECHECK_PERIOD == undefined) {
    RECHECK_PERIOD = 60 * 1000;   // 1 minute
}

// Whether or not to read items on start/restart
var READ_OLD = process.env.READ_OLD;
if (READ_OLD) {
    READ_OLD = true;
} else {
    READ_OLD = false;
}

// Global Variables
var ITEMS = [],
    LATEST = moment("20160101T000000"),
    WORKQUEUE = async.queue(speakout, 1),
    FIRSTRUN = true,
    TIMEFORMAT = 'YYYY MMMM Do h:mma';

//
// Get feed, and send data to speech engine
//
function getFeed() {
    console.log("Checking at "+ moment().format(TIMEFORMAT));
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
	var stream = this
	, meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
	, item;

	while (item = stream.read()) {
	    var date = moment(item.date);
	    if (date <= LATEST) {
		if (!FIRSTRUN) {
		    continue
		}
	    } else {
		LATEST = date;
	    }
	    // Formatting date, eg. "2016 July 18th 4:55pm",
	    // which should be easy to pronounce by the speech engine
	    var date = moment(item.date)
	    var speechdate = date.format(TIMEFORMAT);
	    var text = speechdate + " - " +
		htmlToText.fromString(item.title, {"wordwrap": null}) + " - " +
		htmlToText.fromString(item.description, {"wordwrap": null});
	    console.log(text);

	    if (READ_OLD || !FIRSTRUN) {
		ITEMS.push(text);
	    } else {
		console.log("^^ OLD, not going to speak it out, change READ_OLD=1 to readout whole list on start");
	    }
	}
    });

    // Fired once finished processing stream
    feedparser.on('end', () => {
	console.log('There will be no more data.');
	// async.eachSeries(texts, speakout, function(err) { if (err) {console.log(err);} });
	var numItems = ITEMS.length;
	for (var i = 0; i < numItems; i++) {
	    var lastfeeditem = ITEMS.pop();
	    WORKQUEUE.push(lastfeeditem, function() { console.log("done!")});
	}
	if (FIRSTRUN) {
	    FIRSTRUN = false;
	}
	setTimeout(getFeed, RECHECK_PERIOD);
    });
};

//
// Task of reading out content
//
function speakout(text, callback) {
    console.log("SPEAK => " + text);

    // Festival cannot handle quite marks, clean it
    var textcleaned = text.replace(/["]/gi, '')
    // There are a lot of things that `festival` cannot pronounce,
    // so might need to be more careful about what to pass it through `say`.
    // Find which voices are available by running `festival`, and starting
    // at `(voice_` press TAB to see what is available on the system.
    say.speak(textcleaned, 'voice_ked_diphone', 1.0, function(err) {
	if (err) {
	    console.log(err);
	    callback(err);
	}
	console.log('Text has been spoken.');
	callback();
    });
};

// Let's get started!
getFeed();
