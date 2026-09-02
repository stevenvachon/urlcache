import deepFreeze from 'deep-freeze-strict';
import minURL, { CAREFUL_PROFILE, COMMON_PROFILE, type MinURLOptions } from 'minurl';

export type URLCacheProfile = 'careful' | 'common';

export interface URLCacheOptions {
  /**
   * [minurl](https://npmjs.com/minurl) options used when `profile` is `'careful'`.
   * A provided value replaces the default entirely (it is not merged).
   * @default { ...import('minurl').CAREFUL_PROFILE, removeHash: true }
   */
  carefulProfile?: MinURLOptions;
  /**
   * [minurl](https://npmjs.com/minurl) options used when `profile` is `'common'`.
   * A provided value replaces the default entirely (it is not merged).
   * @default { ...import('minurl').COMMON_PROFILE, removeHash: true }
   */
  commonProfile?: MinURLOptions;
  /**
   * The number of milliseconds that an entry is considered valid before being removed.
   * @default Infinity
   */
  maxAge?: number;
  /**
   * Selects `carefulProfile` or `commonProfile` for URL normalization.
   * @default 'common'
   */
  profile?: URLCacheProfile;
}

export const DEFAULT_OPTIONS = deepFreeze({
  carefulProfile: { ...CAREFUL_PROFILE, removeHash: true },
  commonProfile: { ...COMMON_PROFILE, removeHash: true },
  maxAge: Infinity,
  profile: 'common',
} as const satisfies Required<URLCacheOptions>);

const formatURL = (
  url: URL,
  instanceOptions: Readonly<Required<URLCacheOptions>>,
  customOptions?: Readonly<URLCacheOptions>
) => {
  const profileName = `${customOptions?.profile ?? instanceOptions.profile}Profile` as
    'carefulProfile' | 'commonProfile';
  return minURL(url, {
    ...(customOptions?.[profileName] ?? instanceOptions[profileName]),
    stringify: true,
  });
};

/**
 * Normalized [`URL`](https://mdn.io/URL) key-value cache.
 */
class URLCache<T = unknown> {
  #ages: Record<string, number> = {};
  #options: Required<URLCacheOptions>;
  #size = 0;
  #values: Record<string, T> = {};

  /**
   * Normalized [`URL`](https://mdn.io/URL) key-value cache.
   */
  constructor(options?: Readonly<URLCacheOptions>) {
    this.#options = { ...DEFAULT_OPTIONS, ...options };
    this.clear();
  }

  /**
   * Removes all stored key-value pairs that have expired.
   */
  clean() {
    Object.keys(this.#ages).forEach(url => this.#removeExpired(url));
  }

  /**
   * Removes all stored key-value pairs.
   */
  clear() {
    this.#ages = {};
    this.#size = 0;
    this.#values = {};
  }

  /**
   * Removes the `url` key-value pair.
   * @throws {TypeError} When `url` is not a `URL`.
   */
  delete(url: URL) {
    this.#remove(formatURL(url, this.#options));
  }

  /**
   * Returns the stored value for `url`, or `undefined` if there is none.
   * @throws {TypeError} When `url` is not a `URL`.
   */
  get(url: URL): T | undefined {
    const key = formatURL(url, this.#options);
    this.#removeExpired(key);
    return this.#values[key];
  }

  /**
   * Returns `true` if there is a stored value for `url`.
   * @throws {TypeError} When `url` is not a `URL`.
   */
  has(url: URL) {
    const key = formatURL(url, this.#options);
    this.#removeExpired(key);
    return key in this.#values;
  }

  #remove(key: string) {
    if (key in this.#values) {
      delete this.#ages[key];
      delete this.#values[key];
      this.#size--;
    }
  }

  #removeExpired(key: string) {
    if (this.#ages[key] < Date.now()) {
      this.#remove(key);
    }
  }

  /**
   * Stores `value` associated with `url`. Optionally, define `options` to override any defined in the constructor.
   * @throws {TypeError} When `url` is not a `URL`.
   */
  set(url: URL, value: T, options?: Readonly<URLCacheOptions>) {
    const key = formatURL(url, this.#options, options);

    if (!(key in this.#values)) {
      this.#size++;
    }

    this.#ages[key] = Date.now() + (options?.maxAge ?? this.#options.maxAge);
    this.#values[key] = value;
  }

  /**
   * The number of stored key-value pairs.
   */
  get size() {
    return this.#size;
  }
}

export default URLCache;
