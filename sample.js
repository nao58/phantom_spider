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
