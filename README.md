# urlcache [![NPM Version][npm-image]][npm-url] ![Build Status][ghactions-image] [![Coverage Status][codecov-image]][codecov-url]

> Normalized [`URL`](https://mdn.io/URL/) key-value cache.

In an effort to prevent duplicates, unnecessary URL components will be reduced/normalized.

## Install

```shell
npm install urlcache
```

## Usage

```js
import URLCache from 'urlcache';

const cache = new URLCache({ maxAge: 250 }); // 250ms

const url = new URL('https://host/');

cache.set(url, { key: 'value' });
cache.get(url); //-> { key: 'value' }
cache.has(url); //-> true
cache.size; //-> 1

//cache.delete(url);
//cache.clear();

cache.set(
  url,
  new Promise(
    resolve => setTimeout(() => resolve('value'), 500) // 500ms
  )
);

await cache.get(url); //-> 'value'
await cache.get(url); //-> undefined -- it expired 250ms ago
cache.size; //-> 0
```

[npm-image]: https://img.shields.io/npm/v/urlcache
[npm-url]: https://npmjs.com/urlcache
[ghactions-image]: https://img.shields.io/github/actions/workflow/status/stevenvachon/urlcache/test.yml?branch=next
[codecov-image]: https://img.shields.io/codecov/c/github/stevenvachon/urlcache/next
[codecov-url]: https://app.codecov.io/github/stevenvachon/urlcache/tree/next
