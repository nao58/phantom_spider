(function(phantom) {
  function PhantomSpider() {
    this.page = require('webpage').create();
    this.page.settings.loadImages = false;
    this.page.onError = function(){};
    this.timeout = false;
    this.maxRetry = 3;
    this.convertUrl = function(url){return url;};
  };

  PhantomSpider.prototype.crawl = function(url, depth, onSuccess, onError, filterUrl) {
    var self = this;
    self.onSuccess = onSuccess;
    self.onError = onError;
    self.filterUrl = filterUrl;
    self.loadInProgress = false;
    self.loadIndex = 0
    self.urls = {};
    self.queue = new Array();
    self.push_queue({url: url, depth: depth, ref: ""});
    var interval = setInterval(function(){
      if (!self.loadInProgress) {
        if (self.queue.length > self.loadIndex) {
          self.scrape_queue(self.loadIndex);
        } else {
          phantom.exit();
        };
      };
    }, 1000);
  };

  PhantomSpider.prototype.set_timeout = function(msec) {
    this.timeout = msec;
    this.page.settings.resourceTimeout = this.timeout;
  };

  PhantomSpider.prototype.convert_url = function(url, ref) {
    var ret = url;
    if (url.match(/^https?:\/\//)) {
      ret = url;
    } else if (url.match(/^#/) || url.match(/^[^:]+:\/\//) || url.match(/^javascript:/)) {
      ret = false;
    } else if (url.match(/^\//)){
      var m = ref.match(/^(https?:\/\/[^\/]+)/);
      ret = m[1] + url;
    } else {
      ret = ref + url;
    };
    return this.convertUrl(ret);
  };

  PhantomSpider.prototype.push_queue = function(q) {
    var self = this;
    var url = self.convert_url(q.url, q.ref);
    q.url = url;
    if (url && !(url in self.urls) && self.filterUrl(url)) {
      self.queue.push(q);
      self.urls[url] = true;
    };
  };

  PhantomSpider.prototype.scrape_queue = function(index) {
    var self = this;
    self.loadInProgress = true;
    var q = self.queue[index];
    var page = self.page;
    var redirectUrl = false;
    page.onResourceReceived = function(res) {
      if (q.url == res.url && res.redirectURL) {
        redirectUrl = res.redirectURL;
      };
    };
    page.onNavigationRequested = function(url, type, willNavigate, main) {
      if (url != q.url && main == true) {
        self.push_queue({url: url, depth: q.depth, ref: q.url});
      };
    };
    if (self.timeout) {
      var timeout = setTimeout(function(){
        page.stop();
      }, self.timeout);
    };
    page.open(q.url, function(status){
      if (self.timeout) {
        clearTimeout(timeout);
      };
      self.urls[page.url] = true;
      if (redirectUrl) {
        self.push_queue({url: redirectUrl, depth: q.depth, ref: q.url});
      } else if (status == 'fail') {
        if (self.retryCount++ < self.maxRetry) {
          self.loadIndex--;
        } else {
          self.onError(page, q.url, q.ref, index);
          self.retryCount = 0;
        };
      } else if (q.url == page.url && q.depth >= 0) {
        self.retryCount = 0;
        self.onSuccess(page, q.url, q.ref, index);
        var urls = page.evaluate(function(){
          return Array.prototype.slice.call(document.querySelectorAll("a"), 0).map(function(link){
            return link.getAttribute("href");
          });
        });
        urls = urls.filter(self.filterUrl);
        urls.forEach(function(url){
          self.push_queue({url: url, depth: (q.depth - 1), ref: q.url});
        });
      };
      self.loadIndex++;
      self.loadInProgress = false;
    });
  };

  window.PhantomSpider = PhantomSpider;
})(phantom);
