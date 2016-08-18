# urlcache [![NPM Version][npm-image]][npm-url] ![File Size][filesize-image] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Monitor][greenkeeper-image]][greenkeeper-url]

> Normalized [`URL`](https://developer.mozilla.org/en/docs/Web/API/URL/) key-value cache.


In an effort to prevent duplicates, unnecessary URL components will be (optionally) reduced/normalized.


## Installation

[Node.js](http://nodejs.org) `>= 8` is required. To install, type this at the command line:
```shell
npm install urlcache
```


## Constructor
```js
const URLCache = require('urlcache');
const cache = new URLCache(options);
```


## Methods & Properties

### `.clean()`
Removes all stored key-value pairs that have expired.

### `.clear()`
Removes all stored key-value pairs.

### `.delete(url)`
Removes the `url` key-value pair.

### `.get(url)`
Returns the stored value for `url`, or `undefined` if there is none.

### `.has(url)`
Returns `true` if there is a stored value for `url`.

### `.length`
Returns the number of stored key-value pairs.

### `.set(url, value[, options])`
Stores `value` (any type) associated with `url` key. Optionally, define `options` to override any defined in the constructor.
```js
const url = new URL('http://domain/');

cache.set(url, {'key':'value'});
cache.get(url);  //-> {'key':'value'}

cache.set(url, new Promise((resolve, reject) => {
  // set value after some delayed event
  setTimeout(() => resolve('value'), 500);
});

Promise.resolve(cache.get(url)).then(value =>
  console.log(value)  //-> 'value'
);
```


## Options

### `carefulProfile`
Type: `Object`  
Default value: see [minurl option profiles](https://npmjs.com/minurl#option-profiles)  
A configuration of normalizations performed on URLs to hosts that may not be configured correctly or ideally.

### `commonProfile`
Type: `Object`  
Default value: see [minurl option profiles](https://npmjs.com/minurl#option-profiles)  
A configuration of normalizations performed on URLs to hosts that you expect to be configured correctly and ideally.

### `maxAge`
Type: `Number`  
Default value: `Infinity`  
The number of milliseconds in which a cached value should be considered valid.

### `profile`
Type: `String`  
Default value: `'common'`  
The URL normalization profile. For example, value of `'common'` will use `commonProfile`.

### Default Options
`URLCache.DEFAULT_OPTIONS` is available for customizable extension.


[npm-image]: https://img.shields.io/npm/v/urlcache.svg
[npm-url]: https://npmjs.org/package/urlcache
[filesize-image]: https://img.shields.io/badge/size-3.4kB%20gzipped-blue.svg
[travis-image]: https://img.shields.io/travis/stevenvachon/urlcache.svg
[travis-url]: https://travis-ci.org/stevenvachon/urlcache
[coveralls-image]: https://img.shields.io/coveralls/stevenvachon/urlcache.svg
[coveralls-url]: https://coveralls.io/github/stevenvachon/urlcache
[greenkeeper-image]: https://badges.greenkeeper.io/stevenvachon/urlcache.svg
[greenkeeper-url]: https://greenkeeper.io/
