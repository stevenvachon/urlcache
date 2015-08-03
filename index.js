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
	// If specific key clear
	if (url != null)
	{
		url = parseUrl(url, this.options);
		url = stringifyUrl(url);
		
		if (this.cache[url] !== undefined)
		{
			delete this.cache[url];
		}
		
		if (this.callbacks[url] !== undefined)
		{
			delete this.callbacks[url];
		}
		
		if (this.settingStore[url] !== undefined)
		{
			delete this.settingStore[url];
		}
	}
	// Clear all keys
	else
	{
		this.cache = {};
		this.callbacks = {};
		this.settingStore = {};
	}
};



UrlCache.prototype.contains = function(url)
{
	url = parseUrl(url, this.options);
	url = stringifyUrl(url);
	
	removeOld(url, this);
	
	return this.cache[url]!==undefined || this.settingStore[url]!==undefined;
};



UrlCache.prototype.get = function(url, callback)
{
	url = parseUrl(url, this.options);
	url = stringifyUrl(url);
	
	removeOld(url, this);
	
	// If value has been set
	if (this.cache[url] !== undefined)
	{
		callback( this.cache[url].value );
	}
	// If value will be set -- in other words, `setting()` was called
	else if (this.settingStore[url] !== undefined)
	{
		if (this.callbacks[url] !== undefined)
		{
			this.callbacks[url].push(callback);
		}
		else
		{
			this.callbacks[url] = [callback];
		}
	}
	// Nothing has been or will be set
	else
	{
		callback();
	}
};



UrlCache.prototype.set = function(url, value, expiryTime)
{
	var callbacks,i,numCallbacks;
	
	url = parseUrl(url, this.options);
	url = stringifyUrl(url);
	
	if (expiryTime == null) expiryTime = this.options.expiryTime;
	
	this.cache[url] =
	{
		expiryTime: Date.now() + expiryTime,
		value: value
	};
	
	// If `setting()` was called -- not a manual `set()`
	if (this.settingStore[url] !== undefined)
	{
		callbacks = this.callbacks[url];
		
		// If `get()` was called
		if (callbacks !== undefined)
		{
			numCallbacks = callbacks.length;
			
			for (i=0; i<numCallbacks; i++)
			{
				callbacks[i](value);
			}
			
			delete this.callbacks[url];
		}
		
		delete this.settingStore[url];
	}
};



UrlCache.prototype.setting = function(url)
{
	url = parseUrl(url, this.options);
	
	if (this.contains(url) === false)
	{
		url = stringifyUrl(url);
		
		this.settingStore[url] = true;
	}
};



//::: PRIVATE FUNCTIONS



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
