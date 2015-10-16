# urlcache [![NPM Version][npm-image]][npm-url] [![Bower Version][bower-image]][bower-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][david-image]][david-url]

> URL key-value cache and store.

## Installation

[Node.js](http://nodejs.org/) `>= 0.10` is required. To install, type this at the command line:

```shell
npm install urlcache --save-dev
```
**Note:** Node.js v0.10 will need a `Promise` polyfill.


## Constructor
```js
var UrlCache = require("urlcache");
var cache = new UrlCache(options);
```


## Methods
**Note:** all instances of `url` can be either a `String` or a [`url.parse()`](https://nodejs.org/api/url.html#url_url_parse_urlstr_parsequerystring_slashesdenotehost)-compatible `Object`.

### .clear([url])
Removes `url` from cache. If `url` is not defined, *all* cached key value pairs will be removed.

### .get(url)
Returns a `Promise` with the stored value of `url`. If no such value exists, the promise will be rejected.
```js
cache.get("url").then(function(value) {
    console.log(value);  //-> "value"
});

cache.get("unstored").catch(function(error) {
    // not in cache (or value is a rejected Promise)
});
```

### .set(url, value[, expiryTime])
Stores `value` (any type) into `url` key. Optionally, define `expiryTime` to override `options.expiryTime`. **Note:** any value passed in gets wrapped in `Promise.resolve`.
```js
cache.set("url", {"key":"value"});

cache.get("url").then(function(value) {
    console.log(value);  //-> {"key":"value"}
});

cache.set("url", new Promise(function(resolve, reject) {
	// set value after some delayed event
	setTimeout(function() {
		resolve("value");
	}, 500);
});

cache.get("url").then(function(value) {
    console.log(value);  //-> "value"
});
```


## Options

### options.defaultPorts
Type: `Object`  
Default value: see [urlobj.parse() options](https://github.com/stevenvachon/urlobj)  
A map of protocol default ports for `options.normalizeUrls`.

### options.expiryTime
Type: `Number`  
Default value: `Infinity`  
The number of milliseconds in which a cached value should be considered valid.

### options.normalizeUrls
Type: `Boolean`  
Default value: `true`  
When `true`, will remove unnecessary URL parts in order to avoid duplicates in cache.

### options.stripUrlHashes
Type: `Boolean`  
Default Value: `true`  
When `true`, will remove `#hashes` from URLs. They are most likely not useful to you because they are local to the document that contains them.


## Changelog
* 0.4.0 simpler `Promise`-based API
* 0.3.0 added `options.defaultPorts`, more tests
* 0.2.0 simplified API
* 0.1.0 initial release


[npm-image]: https://img.shields.io/npm/v/urlcache.svg
[npm-url]: https://npmjs.org/package/urlcache
[bower-image]: https://img.shields.io/bower/v/urlcache.svg
[bower-url]: https://github.com/stevenvachon/urlcache
[travis-image]: https://img.shields.io/travis/stevenvachon/urlcache.svg
[travis-url]: https://travis-ci.org/stevenvachon/urlcache
[david-image]: https://img.shields.io/david/stevenvachon/urlcache.svg
[david-url]: https://david-dm.org/stevenvachon/urlcache
