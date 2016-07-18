# feed-text2speech-node

Using local text-to-speech to read out an online stream (RSS/ATOM/...).
Work in progress!

Uses [Festival](http://www.cstr.ed.ac.uk/projects/festival/) as text-to-speech
system.

What's read out is a combination of `date - title - description`, e.g: `2016 July 18th 8:02am - Moonlit launch for SpaceX rocket carrying ISS supplies - A SpaceX cargo rocket is bound for the International Space Station after a successful launch from Florida.`

## Config

* `FEED_URL`: setenvironmental variable in the resin.io dashboard,
  to point to the feed URL. If not set, defaults to [BBC World News](http://feeds.bbci.co.uk/news/world/rss.xml).
* `RECHECK_PERIOD`: how often to re-check feed, in `ms`, default is `60000` (i.e. every 1 minute)
* `READ_OLD`: define it to `1` if want to read out old feed items on application start/restart. By default only
   new feed items found after the first update run on application start are read out (do not define, or make variable empty string).

## License

Released unter [Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0).