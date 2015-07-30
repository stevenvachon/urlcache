"use strict";
var objectAssign = require("object-assign");
var urllib = require("url");
var urlobj = require("urlobj");

var defaultOptions = 
{
	expiryTime: Infinity, /*3600000,*/
	normalizeUrls: true,
	stripUrlHashes: true
};



function UrlCache(options)
{
	this.options = objectAssign({}, defaultOptions, options);
	
	this.clear();
}



UrlCache.prototype.clear = function()
{
	this.cache = {};
	this.settingStore = {};
};



UrlCache.prototype.contains = function(url)
{
	url = parseUrl(url, this.options);
	url = stringifyUrl(url);
	
	removeOld(url, this);
	
	return this.cache[url] !== undefined;
};



UrlCache.prototype.get = function(url)
{
	url = parseUrl(url, this.options);
	url = stringifyUrl(url);
	
	removeOld(url, this);
	
	if (this.cache[url] !== undefined)
	{
		return this.cache[url].value;
	}
};



UrlCache.prototype.getWhenSet = function(url, callback)
{
	url = parseUrl(url, this.options);
	url = stringifyUrl(url);
	
	if (Array.isArray(this.settingStore[url]) === true)
	{
		this.settingStore[url].push(callback);
	}
	else
	{
		this.settingStore[url] = [callback];
	}
};



UrlCache.prototype.isSetting = function(url)
{
	url = parseUrl(url, this.options);
	url = stringifyUrl(url);
	
	return this.settingStore[url] !== undefined;
};



UrlCache.prototype.set = function(url, value, expiryTime)
{
	var callbacks,i,numCallbacks;
	
	url = parseUrl(url, this.options);
	url = stringifyUrl(url);
	
	callbacks = this.settingStore[url];
	
	if (expiryTime == null) expiryTime = this.options.expiryTime;
	
	this.cache[url] =
	{
		expiryTime: Date.now() + expiryTime,
		value: value
	};
	
	// If `setting()` was called -- not a manual `set()`
	if (callbacks !== undefined)
	{
		if (Array.isArray(callbacks) === true)
		{
			numCallbacks = callbacks.length;
			
			for (i=0; i<numCallbacks; i++)
			{
				callbacks[i](value);
			}
		}
		
		delete this.settingStore[url];
	}
};



UrlCache.prototype.setting = function(url)
{
	url = parseUrl(url, this.options);
	
	if (this.isSetting(url) === false)
	{
		url = stringifyUrl(url);
		
		this.settingStore[url] = true;
	}
};



//::: PRIVATE FUNCTIONS



function parseUrl(url, options)
{
	url = urlobj.parse(url);
	
	if (options.normalizeUrls === true)
	{
		urlobj.normalize(url);
	}
	
	if (options.stripUrlHashes===true && url.hash!=null)
	{
		url.hash = null;
		url.href = stringifyUrl(url);
	}
	
	return url;
}



function removeOld(url, thisObj)
{
	if (thisObj.cache[url] !== undefined)
	{
		if ( thisObj.cache[url].expiryTime < Date.now() )
		{
			delete thisObj.cache[url];
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
