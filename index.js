"use strict";
var objectAssign = require("object-assign");
var urllib = require("url");
var urlobj = require("urlobj");

var defaultOptions = 
{
	defaultPorts: null,  // will use urlobj default value
	expiryTime: Infinity,
	normalizeUrls: true,
	stripUrlHashes: true
};



function UrlCache(options)
{
	this.options = objectAssign({}, defaultOptions, options);
	
	this.clear();
}



UrlCache.prototype.clear = function(url)
{
	if (url != null)
	{
		url = parseUrl(url, this.options);
		url = stringifyUrl(url);
		
		if (this.cache[url] !== undefined)
		{
			delete this.cache[url];
		}
	}
	else
	{
		this.cache = {};
	}
};



UrlCache.prototype.get = function(url)
{
	url = formatUrl(url, this.options);
	
	removeExpired(url, this.cache);
	
	if (this.cache[url] !== undefined)
	{
		return Promise.resolve( this.cache[url].value );
	}
	
	return Promise.reject( new Error("key not found") );
};



UrlCache.prototype.set = function(url, value, expiryTime)
{
	// Avoid filling cache with values that will only cause rejection
	if (value === undefined) return;
	
	url = formatUrl(url, this.options);
	
	if (expiryTime == null) expiryTime = this.options.expiryTime;
	
	this.cache[url] =
	{
		expiryTime: Date.now() + expiryTime,
		value: value
	};
};



//::: PRIVATE FUNCTIONS



function formatUrl(url, options)
{
	url = parseUrl(url, options);
	url = stringifyUrl(url);
	
	return url;
}



function parseUrl(url, options)
{
	if (options.defaultPorts != null)
	{
		url = urlobj.parse(url, {defaultPorts:options.defaultPorts});
	}
	else
	{
		// Avoid overriding the default value of `defaultPorts` with null/undefined
		url = urlobj.parse(url);
	}
	
	if (options.normalizeUrls === true)
	{
		// TODO :: this mutates input
		urlobj.normalize(url);
	}
	
	if (options.stripUrlHashes===true && url.hash!=null)
	{
		// TODO :: this mutates input
		url.hash = null;
		url.href = stringifyUrl(url);
	}
	
	return url;
}



function removeExpired(url, cache)
{
	if (cache[url] !== undefined)
	{
		if ( cache[url].expiryTime < Date.now() )
		{
			delete cache[url];
		}
	}
}



function stringifyUrl(url)
{
	if (url!==null && typeof url==="object" && url instanceof String===false)
	{
		return urllib.format(url);  // TODO :: use urlobj.format() when available
	}
}



module.exports = UrlCache;
