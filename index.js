"use strict";
const deepFreeze = require("deep-freeze-node");
const defined = require("defined");
const minURL = require("minurl");

const DEFAULT_OPTIONS =
{
	carefulProfile: { ...minURL.CAREFUL_PROFILE, removeHash:true },
	commonProfile:  { ...minURL.COMMON_PROFILE,  removeHash:true },
	maxAge: Infinity,
	profile: "common"
};



const formatURL = (url, instanceOptions, customOptions={}) =>
{
	const profileName = `${ defined(customOptions.profile, instanceOptions.profile) }Profile`;
	const profile = defined(customOptions[profileName], instanceOptions[profileName]);

	return minURL(url, profile);
};



const remove = (instance, url) =>
{
	if (url in instance.values)
	{
		delete instance.ages[url];
		delete instance.values[url];

		instance.count--;
	}
};



const removeExpired = (instance, url) =>
{
	if (instance.ages[url] < Date.now())
	{
		remove(instance, url);
	}
};



class URLCache
{
	constructor(options)
	{
		this.options = { ...DEFAULT_OPTIONS, ...options };

		this.clear();
	}



	clean()
	{
		Object.keys(this.ages).forEach(url => removeExpired(this, url));
	}



	clear()
	{
		this.ages = {};
		this.count = 0;
		this.values = {};
	}



	delete(url)
	{
		remove(this, formatURL(url, this.options));
	}



	get(url)
	{
		url = formatURL(url, this.options);

		removeExpired(this, url);

		return this.values[url];
	}



	has(url)
	{
		url = formatURL(url, this.options);

		removeExpired(this, url);

		return url in this.values;
	}



	get length()
	{
		return this.count;
	}



	// TODO :: `url, headers, value, options` ... key can be a hash from url and headers
	// see https://github.com/ForbesLindesay/http-basic/issues/24#issuecomment-293630902
	set(url, value, options={})
	{
		url = formatURL(url, this.options, options);

		const maxAge = defined(options.maxAge, this.options.maxAge);

		this.ages[url] = Date.now() + maxAge;
		this.values[url] = value;

		this.count++;
	}
}



URLCache.DEFAULT_OPTIONS = DEFAULT_OPTIONS;



module.exports = deepFreeze(URLCache);
