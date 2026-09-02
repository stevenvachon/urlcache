import { describe, expect, expectTypeOf, it } from 'vitest';
import * as Index from './index.ts';

const { default: URLCache, DEFAULT_OPTIONS } = Index;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

it('has named exports', () =>
  ['DEFAULT_OPTIONS'].forEach(namedExport => expect(Index).toHaveProperty(namedExport)));

it('has immutable named exports', () => {
  // @ts-expect-error -- assigning to read-only prop
  expect(() => (DEFAULT_OPTIONS.profile = 'careful')).toThrow(TypeError);
  // @ts-expect-error -- invalid prop
  expect(() => (DEFAULT_OPTIONS.careful = 'changed')).toThrow(TypeError);
});

it('has named type exports', () => {
  expectTypeOf<Index.URLCacheOptions>();
  expectTypeOf<Index.URLCacheProfile>();
});

it('has a default export', () => expect(Index).toHaveProperty('default'));

describe('has()', () => {
  it('determines if a value exists', () => {
    const cache = new URLCache();
    const url1 = new URL('https://some-url');
    const url2 = new URL('https://another-url');
    cache.set(url1, 1);
    cache.set(url2, 2);
    expect(cache.has(url1)).toBe(true);
    expect(cache.has(url2)).toBe(true);
  });

  it('determines if no value exists', () => {
    const cache = new URLCache();
    const url1 = new URL('https://some-url');
    const url2 = new URL('https://another-url');
    expect(cache.has(url1)).toBe(false);
    expect(cache.has(url2)).toBe(false);
  });

  it('rejects non-URL keys', () => {
    const cache = new URLCache();
    // @ts-expect-error -- unsupported value
    expect(() => cache.has('url')).toThrow(TypeError);
    // @ts-expect-error -- unsupported value
    expect(() => cache.has({})).toThrow(TypeError);
  });
});

describe('get()', () => {
  it('gets a value', () => {
    const cache = new URLCache();
    const url1 = new URL('https://some-url');
    const url2 = new URL('https://another-url');
    cache.set(url1, 1);
    cache.set(url2, undefined);
    expect(cache.get(url1)).toBe(1);
    expect(cache.get(url2)).toBeUndefined();
  });

  it('gets no value if none exists', () => {
    const cache = new URLCache();
    const url1 = new URL('https://some-url');
    const url2 = new URL('https://another-url');
    expect(cache.get(url1)).toBeUndefined();
    expect(cache.get(url2)).toBeUndefined();
  });

  it('rejects non-URL keys', () => {
    const cache = new URLCache();
    // @ts-expect-error -- unsupported value
    expect(() => cache.get('url')).toThrow(TypeError);
    // @ts-expect-error -- unsupported value
    expect(() => cache.get({})).toThrow(TypeError);
  });

  it('supports values containing Promises', async () => {
    const cache = new URLCache();
    const url1 = new URL('https://some-url');
    const url2 = new URL('https://another-url');
    cache.set(url1, new Promise<number>(resolve => setImmediate(() => resolve(1))));
    cache.set(url2, new Promise<never>((_, reject) => setImmediate(() => reject())));
    await expect(cache.get(url1)).resolves.toBe(1);
    await expect(cache.get(url2)).rejects.toBeUndefined();
  });
});

// NOTE :: option overrides are tested in "options" area
describe('set()', () => {
  it('sets a value', () => {
    const cache = new URLCache();
    const url1 = new URL('https://some-url');
    const url2 = new URL('https://another-url');
    cache.set(url1, 'some value');
    cache.set(url2, 'another value');
    expect(cache.get(url1)).toBe('some value');
    expect(cache.get(url2)).toBe('another value');
  });

  it('overwrites a value', () => {
    const cache = new URLCache();
    const url1 = new URL('https://some-url');
    const url2 = new URL('https://another-url');

    let value1 = 'some value';
    let value2 = 'another value';
    cache.set(url1, value1);
    cache.set(url2, value2);
    expect(cache.get(url1)).toBe(value1);
    expect(cache.get(url2)).toBe(value2);

    value1 = 'some other value';
    value2 = 'yet another value';
    cache.set(url1, value1);
    cache.set(url2, value2);
    expect(cache.get(url1)).toBe(value1);
    expect(cache.get(url2)).toBe(value2);
  });

  it('rejects non-URL keys', () => {
    const cache = new URLCache();
    // @ts-expect-error -- unsupported value
    expect(() => cache.set('url', 'value')).toThrow(TypeError);
    // @ts-expect-error -- unsupported value
    expect(() => cache.set({}, 'value')).toThrow(TypeError);
  });
});

describe('delete()', () => {
  it('removes a key-value pair', () => {
    const cache = new URLCache();
    const url1 = new URL('https://some-url');
    const url2 = new URL('https://another-url');
    cache.set(url1, 'some value');
    cache.set(url2, 'another value');
    cache.delete(url1);
    cache.delete(url2);
    expect(cache.has(url1)).toBe(false);
    expect(cache.has(url2)).toBe(false);
  });

  it('rejects non-URL keys', () => {
    const cache = new URLCache();
    // @ts-expect-error -- unsupported value
    expect(() => cache.delete('url')).toThrow(TypeError);
    // @ts-expect-error -- unsupported value
    expect(() => cache.delete({})).toThrow(TypeError);
  });
});

describe('clean()', () => {
  it('removes expired key-value pairs', () => {
    const cache = new URLCache();
    const url1 = new URL('https://some-url');
    const url2 = new URL('https://another-url');
    cache.set(url1, 'some value');
    cache.set(url2, 'another value', { maxAge: -1 });
    cache.clean();
    expect(cache.has(url1)).toBe(true);
    expect(cache.has(url2)).toBe(false);
  });
});

describe('clear()', () => {
  it('removes all key-value pairs', () => {
    const cache = new URLCache();
    const url1 = new URL('https://some-url');
    const url2 = new URL('https://another-url');
    cache.set(url1, 'some value');
    cache.set(url2, 'another value');
    cache.clear();
    expect(cache.has(url1)).toBe(false);
    expect(cache.has(url2)).toBe(false);
  });
});

describe('size', () => {
  it('works', () => {
    const cache = new URLCache();

    expect(cache.size).toBe(0);

    cache.clean();
    expect(cache.size).toBe(0);

    cache.clear();
    expect(cache.size).toBe(0);

    cache.delete(new URL('https://not-available'));
    expect(cache.size).toBe(0);

    cache.set(new URL('https://some-url1'), 'some value1');
    expect(cache.size).toBe(1);

    cache.set(new URL('https://some-url1'), 'new value');
    expect(cache.size).toBe(1);

    cache.set(new URL('https://some-url2'), 'some value2');
    cache.set(new URL('https://some-url3'), 'some value3');
    cache.set(new URL('https://some-url4'), 'some value4', { maxAge: -1 });
    expect(cache.size).toBe(4);

    cache.delete(new URL('https://not-available'));
    expect(cache.size).toBe(4);

    cache.delete(new URL('https://some-url3'));
    expect(cache.size).toBe(3);

    cache.clean();
    expect(cache.size).toBe(2);

    cache.clear();
    expect(cache.size).toBe(0);
  });
});

describe('options', () => {
  it('maxAge = 50', async () => {
    const cache = new URLCache({ maxAge: 50 });
    const url = new URL('https://some-url');
    const value = 'some value';

    cache.set(url, value);
    expect(cache.has(url)).toBe(true);
    expect(cache.get(url)).toBe(value);
    expect(cache.size).toBe(1);

    await wait(100);

    expect(cache.has(url)).toBe(false);
    expect(cache.get(url)).toBeUndefined();
    expect(cache.size).toBe(0);

    cache.set(url, value);
    expect(cache.has(url)).toBe(true);
    expect(cache.get(url)).toBe(value);
    expect(cache.size).toBe(1);

    await wait(100);

    expect(cache.has(url)).toBe(false);
    expect(cache.get(url)).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  it('maxAge = 50 (specific override)', async () => {
    const cache = new URLCache({ maxAge: 500 });
    const url = new URL('https://some-url');
    const value = 'some value';

    cache.set(url, value, { maxAge: 50 });
    expect(cache.has(url)).toBe(true);
    expect(cache.get(url)).toBe(value);
    expect(cache.size).toBe(1);

    await wait(100);

    expect(cache.has(url)).toBe(false);
    expect(cache.get(url)).toBeUndefined();
    expect(cache.size).toBe(0);

    cache.set(url, value, { maxAge: 50 });
    expect(cache.has(url)).toBe(true);
    expect(cache.get(url)).toBe(value);
    expect(cache.size).toBe(1);

    await wait(100);

    expect(cache.has(url)).toBe(false);
    expect(cache.get(url)).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  it('profile = "common"', () => {
    const cache = new URLCache();
    const url1 = new URL('https://domain.com/path/to/index.html?#');
    const url2 = new URL('https://domain.com/path/to/');
    const value1 = 'some value';
    const value2 = 'another value';

    cache.set(url1, value1);
    expect(cache.get(url1)).toBe(value1);

    cache.set(url2, value2);
    expect(cache.get(url1)).toBe(value2); // Has been overwritten
  });

  it('profile = "careful"', () => {
    const cache = new URLCache({ profile: 'careful' });
    const url1 = new URL('https://domain.com/path/to/index.html?#');
    const url2 = new URL('https://domain.com/path/to/');
    const value1 = 'some value';
    const value2 = 'another value';

    cache.set(url1, value1);
    expect(cache.get(url1)).toBe(value1);

    cache.set(url2, value2);
    expect(cache.get(url1)).toBe(value1); // Has not been overwritten
  });

  it('carefulProfile = {…}', () => {
    const cache = new URLCache({
      profile: 'careful',
      carefulProfile: { defaultPorts: { 'protocol:': 1234 } },
    });
    const urlA1 = new URL('protocol://domain.com:1234/path/');
    const urlA2 = new URL('protocol://domain.com/path/');
    const urlB1 = new URL('https://domain.com/#hash');
    const urlB2 = new URL('https://domain.com/');
    const value1 = 'some value';
    const value2 = 'another value';

    cache.set(urlA1, value1);
    cache.set(urlB1, value1);
    expect(cache.get(urlA1)).toBe(value1);
    expect(cache.get(urlB1)).toBe(value1);

    cache.set(urlA2, value2);
    cache.set(urlB2, value2);
    expect(cache.get(urlA1)).toBe(value2); // Has been overwritten

    expect(cache.get(urlB1)).toBe(value1); // Has not been overwritten
    expect(cache.get(urlB2)).toBe(value2); // Has not been overwritten
  });

  it('commonProfile = {…}', () => {
    const cache = new URLCache({
      commonProfile: { defaultPorts: { 'protocol:': 1234 } },
    });
    const urlA1 = new URL('protocol://domain.com:1234/path/');
    const urlA2 = new URL('protocol://domain.com/path/');
    const urlB1 = new URL('https://domain.com/#hash');
    const urlB2 = new URL('https://domain.com/');
    const value1 = 'some value';
    const value2 = 'another value';

    cache.set(urlA1, value1);
    cache.set(urlB1, value1);
    expect(cache.get(urlA1)).toBe(value1);
    expect(cache.get(urlB1)).toBe(value1);

    cache.set(urlA2, value2);
    cache.set(urlB2, value2);
    expect(cache.get(urlA1)).toBe(value2); // Has been overwritten

    expect(cache.get(urlB1)).toBe(value1); // Has not been overwritten
    expect(cache.get(urlB2)).toBe(value2); // Has not been overwritten
  });
});
