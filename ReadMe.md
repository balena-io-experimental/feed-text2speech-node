# feed-text2speech-node

Using local text-to-speech to read out an online stream (RSS/ATOM/...).
Work in progress!

Uses [Festival](http://www.cstr.ed.ac.uk/projects/festival/) as text-to-speech
system.

## Config

* `FEED_URL`: setenvironmental variable in the resin.io dashboard,
  to point to the feed URL. If not set, defaults to BBC World News.

## License

Released unter [Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0).