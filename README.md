# urlcache [![NPM Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][david-image]][david-url]

> URL key-value cache and store.

## Installation

[Node.js](http://nodejs.org/) `~0.10` is required. To install, type this at the command line:

```shell
npm install urlcache --save-dev
```


## Usage

```js
var UrlCache = require("urlcache");
var cache = new UrlCache(options);

cache.set("http://domain.com/#hash", "value");
cache.set("http://domain.com/path/to/something.html", {"key":"value"});
```


## Methods
**Note:** all instances of `url` can be either a `String` or a [`url.parse()`](https://nodejs.org/api/url.html#url_url_parse_urlstr_parsequerystring_slashesdenotehost)-compatible `Object`.

### .clear([url])
Removes `url` from cache (whether defined with `set()` or `setting()`). If `url` is not defined, *all* cached key value pairs will be removed.

### .contains(url)
Returns `true` if `url` currently has a value stored or in the process of being stored in cache; `false` if it does not.

### .get(url, callback)
Runs `callback` when the value of `url` has been stored. If called before `set()` and/or `setting()`, the value will be `undefined`.
```js
cache.get("url", function(value) {
    console.log(value);  //-> undefined
});

cache.setting("url");
cache.get("url", function(value) {
    console.log(value);  //-> "value"
});
cache.set("url", "value");
```

### .set(url, value, expiryTime)
Stores `value` (any type) into `url` key. Optionally, define `expiryTime` to override `options.expiryTime`.

### .setting(url)
Marks `url` as being in the process of storing its value in cache. If the value of `url` has already been stored, nothing will be marked.


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
When `true`, will remove `#hashes` from URLs because they are local to the document that contains them.


## Changelog
* 0.3.0 added `options.defaultPorts`, more tests
* 0.2.0 simplified API
* 0.1.0 initial release


[npm-image]: https://img.shields.io/npm/v/urlcache.svg
[npm-url]: https://npmjs.org/package/urlcache
[travis-image]: https://img.shields.io/travis/stevenvachon/urlcache.svg
[travis-url]: https://travis-ci.org/stevenvachon/urlcache
[david-image]: https://img.shields.io/david/stevenvachon/urlcache.svg
[david-url]: https://david-dm.org/stevenvachon/urlcache
