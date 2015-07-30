# urlcache [![NPM Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][david-image]][david-url]

> Cache URL responses.

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

console.log( cache.get("http://domain.com/") );  //-> "value"
```


## Methods
Note: all instances of `url` can be either a `String` or a [`url.parse()`](https://nodejs.org/api/url.html#url_url_parse_urlstr_parsequerystring_slashesdenotehost)-compatible `Object`.

### .clear()
Removes all cached key value pairs.

### .contains(url)
Returns `true` if `url` currently has a value stored in cache; `false` if it does not.

### .isSetting(url)
Returns `true` if `url` currently has a value in the process of being stored in cache (as in, the request is likely incomplete); `false` if it does not.

### .get(url)
Retrieves a cached value at `url` key.

### .getWhenSet(url, callback)
Runs `callback` when the value of `url` has been stored in cache.
```js
cache.getWhenSet("url", function(value) {
    console.log(value);  //-> "value"
});
cache.set("url", "value");
```

### .set(url, value, expiryTime)
Stores `value` into `url` key. Optionally, define `expiryTime` to override `options.expiryTime` as the number of milliseconds in which it should be considered valid.

### .setting(url)
Marks `url` as being in the process of storing its value in cache. For use with `isSetting()`.


## Options

### options.expiryTime
Type: `Number`  
Default value: `Infinity`  
The number of milliseconds in which a cached value should be considered valid. Can be overridden per key/value with `set()`.

### options.normalizeUrls
Type: `Boolean`  
Default value: `true`  
When `true`, will remove unnecessary URL parts in order to avoid duplicates in cache.

### options.stripUrlHashes
Type: `Boolean`  
Default Value: `true`  
When `true`, will remove `#hashes` from URLs because they are local to the document that contains them.


## Changelog
* 0.1.0 initial release


[npm-image]: https://img.shields.io/npm/v/urlcache.svg
[npm-url]: https://npmjs.org/package/urlcache
[travis-image]: https://img.shields.io/travis/stevenvachon/urlcache.svg
[travis-url]: https://travis-ci.org/stevenvachon/urlcache
[david-image]: https://img.shields.io/david/stevenvachon/urlcache.svg
[david-url]: https://david-dm.org/stevenvachon/urlcache
