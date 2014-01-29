PhantomSpider
=============

well-mannered spider via phantomjs
I mean, this spider keeps single-thread crawling. Alright, it's slow... but that's why it's gentre
for the servers and clients.

## Usage

You can create any your own crawling script (ie. sample.js). The `spider.js` script should be
required at the top of the script, then you can call `PhantomSpider` class.

```javascript:sample.js
phantom.injectJs('./spider.js');
new PhantomSpider().crawl('http://example.com', 3,
  function(page, url, ref) {
    // onSuccess
  },
  function(page, url, ref) {
    // onError
  },
  function(url) {
    // filterUrl
    return true;
  }
);
```

Then just call the script.

```bash
phantomjs sample.js
```

## Example

```javascript:sample.js
phantom.injectJs('./spider.js');

/*
 * start crawling from the top of the Yahoo! SPORTS MLB
 */
var ps = new PhantomSpider();
// change phantomjs page settings
ps.page.settings.loadImage = false;
// start crawl
ps.crawl("http://sports.yahoo.com/mlb/", 1,
    function(page, url, ref) {
      // onSuccess
      var title = page.evaluate(function(){return document.title;});
      console.log(title + "\t" + url + "\t" + ref);
    },
    function(page, url, ref) {
      // onError
      console.log("LOAD ERROR:" + "\t" + url + "\t" + ref);
    },
    function(url) {
      // filtering pages
        return (url.match(/\/mlb\//));
    }
);
```

output below;

```
LB on Yahoo! Sports - News, Scores, Standings, Rumors, Fantasy Games   http://sports.yahoo.com/mlb/
Sign in to Yahoo
https://login.yahoo.com/config/login?.src=spt&.intl=us&.lang=en-US&.done=http://sports.yahoo.com/mlb/
http://sports.yahoo.com/mlb/
Detroit at Atlanta | 2014-02-26 | Major League Baseball | Yahoo! Sports
http://sports.yahoo.com/mlb/detroit-tigers-atlanta-braves-340226115/    http://sports.yahoo.com/mlb/
Toronto at Philadelphia | 2014-02-26 | Major League Baseball | Yahoo! Sports
http://sports.yahoo.com/mlb/toronto-blue-jays-philadelphia-phillies-340226122/
http://sports.yahoo.com/mlb/
NY Yankees at Pittsburgh | 2014-02-26 | Major League Baseball | Yahoo! Sports
http://sports.yahoo.com/mlb/new-york-yankees-pittsburgh-pirates-340226123/
http://sports.yahoo.com/mlb/
Cincinnati at Cleveland | 2014-02-26 | Major League Baseball | Yahoo! Sports
http://sports.yahoo.com/mlb/cincinnati-reds-cleveland-indians-340226105/
http://sports.yahoo.com/mlb/
    :
    :
```
