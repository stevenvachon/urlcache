"use strict";
var UrlCache = require("./");

var chai = require("chai");
var objectAssign = require("object-assign");
var urllib = require("url");

var expect = chai.expect;
chai.use( require("chai-as-promised") );

if (global.Promise === undefined)
{
	global.Promise = require("bluebird");
}



function options(overrides)
{
	var testDefaults = 
	{
		// All others will use default values
		// as this will ensure that when they change, tests WILL break
		normalizeUrls: false,
		stripUrlHashes: false
	};
	
	return objectAssign({}, testDefaults, overrides);
}



describe("get()", function()
{
	it("should get a value", function()
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = "another url";
		
		// Sets internal value
		cache.cache[url1] = { expiryTime:Infinity, value:1 };
		cache.cache[url2] = { expiryTime:Infinity, value:2 };
		
		url2 = urllib.parse(url2);
		
		expect( cache.get(url1) ).to.eventually.equal(1);
		expect( cache.get(url2) ).to.eventually.equal(2);
	});
	
	
	
	it("should support values containing Promises", function()
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = "another url";
		var value1 = new Promise(function(resolve,reject){ setImmediate(function(){ resolve(1) }) });
		var value2 = new Promise(function(resolve,reject){ setImmediate(function(){ reject()   }) });
		
		// Sets internal value
		cache.cache[url1] = { expiryTime:Infinity, value:value1 };
		cache.cache[url2] = { expiryTime:Infinity, value:value2 };
		
		url2 = urllib.parse(url2);
		
		expect( cache.get(url1) ).to.eventually.equal(1);
		expect( cache.get(url2) ).to.be.rejected;
	});
	
	
	
	it("should reject a key with no value", function()
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		
		expect( cache.get(url1) ).to.be.rejected;
		expect( cache.get(url2) ).to.be.rejected;
	});
});



// NOTE :: `expiryTime` is tested in "options" area
describe("set()", function()
{
	it("should get what was set", function()
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		
		cache.set(url1, "some value");
		cache.set(url2, "another value");
		
		expect( cache.get(url1) ).to.eventually.equal("some value");
		expect( cache.get(url2) ).to.eventually.equal("another value");
	});
	
	
	
	it("should overwrite a value", function()
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		var value1 = "some value";
		var value2 = "another value";
		
		cache.set(url1, value1);
		cache.set(url2, value2);
		expect( cache.get(url1) ).to.eventually.equal(value1);
		expect( cache.get(url2) ).to.eventually.equal(value2);
		
		value1 = "some other value";
		value2 = "yet another value";
		
		cache.set(url1, value1);
		cache.set(url2, value2);
		expect( cache.get(url1) ).to.eventually.equal(value1);
		expect( cache.get(url2) ).to.eventually.equal(value2);
	});
});



describe("clear()", function()
{
	it("should work specifically", function()
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		
		cache.set(url1, "some value");
		cache.set(url2, "another value");
		cache.clear(url1);
		cache.clear(url2);
		
		expect( cache.get(url1) ).to.be.rejected;
		expect( cache.get(url2) ).to.be.rejected;
	});
	
	
	
	it("should work globally", function()
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		
		cache.set(url1, "some value");
		cache.set(url2, "another value");
		cache.clear();
		
		expect( cache.get(url1) ).to.be.rejected;
		expect( cache.get(url2) ).to.be.rejected;
	});
});



describe("options", function()
{
	it("expiryTime = 50", function(done)
	{
		var cache = new UrlCache( options({ expiryTime:50 }) );
		var url = "some url";
		var value = "some value";
		
		cache.set(url, value);
		
		expect( cache.get(url) ).to.eventually.equal(value);
		
		setTimeout( function()
		{
			expect( cache.get(url) ).to.be.rejected;
			
			cache.set(url, value);
			
			expect( cache.get(url) ).to.eventually.equal(value);
			
			setTimeout( function()
			{
				expect( cache.get(url) ).to.be.rejected;
				
				setTimeout(function(){ done() }, 50);
			
			}, 100);
		
		}, 100);
	});
	
	
	
	it("expiryTime = 50 (specific override)", function(done)
	{
		var cache = new UrlCache( options({ expiryTime:500 }) );
		var url = "some url";
		var value = "some value";
		
		cache.set(url, value, 50);
		
		expect( cache.get(url) ).to.eventually.equal(value);
		
		setTimeout( function()
		{
			expect( cache.get(url) ).to.be.rejected;
			
			cache.set(url, value, 50);
			
			expect( cache.get(url) ).to.eventually.equal(value);
			
			setTimeout( function()
			{
				expect( cache.get(url) ).to.be.rejected;
				
				setTimeout(function(){ done() }, 50);
			
			}, 100);
		
		}, 100);
	});
	
	
	
	it("normalizeUrls = false", function(done)
	{
		var cache = new UrlCache( options() );
		var url1 = "http://domain.com/path/../to/something/../index.html";
		var url2 = "http://domain.com/to/index.html";
		var value1 = "some value";
		var value2 = "another value";
		
		cache.set(url1, value1);
		
		expect( cache.get(url1) ).to.eventually.equal(value1);
		
		setTimeout( function()
		{
			cache.set(url2, value2);
			
			// Has not been overwritten
			expect( cache.get(url1) ).to.eventually.equal(value1);
			
			setTimeout(function(){ done() }, 50);
		
		}, 50);
	});
	
	
	
	it("normalizeUrls = true", function(done)
	{
		var cache = new UrlCache( options({ normalizeUrls:true }) );
		var url1 = "http://domain.com/path/../to/something/../index.html";
		var url2 = "http://domain.com/to/index.html";
		var value1 = "some value";
		var value2 = "another value";
		
		cache.set(url1, value1);
		
		expect( cache.get(url1) ).to.eventually.equal(value1);
		
		setTimeout( function()
		{
			cache.set(url2, value2);
			
			// Has been overwritten
			expect( cache.get(url1) ).to.eventually.equal(value2);
			
			setTimeout(function(){ done() }, 50);
		
		}, 50);
	});
	
	
	
	it("normalizeUrls = true, defaultPorts = {…}", function(done)
	{
		var cache = new UrlCache( options({ defaultPorts:{protocol:1234}, normalizeUrls:true }) );
		var url1 = "protocol://domain.com:1234/path/to/";
		var url2 = "protocol://domain.com/path/to/";
		var value1 = "some value";
		var value2 = "another value";
		
		cache.set(url1, value1);
		
		expect( cache.get(url1) ).to.eventually.equal(value1);
		
		setTimeout( function()
		{
			cache.set(url2, value2);
			
			// Has been overwritten
			expect( cache.get(url1) ).to.eventually.equal(value2);
			
			setTimeout(function(){ done() }, 50);
		
		}, 50);
	});
	
	
	
	it("stripUrlHashes = false", function(done)
	{
		var cache = new UrlCache( options() );
		var url1 = "http://domain.com/path/to/#hash";
		var url2 = "http://domain.com/path/to/";
		var value1 = "some value";
		var value2 = "another value";
		
		cache.set(url1, value1);
		
		expect( cache.get(url1) ).to.eventually.equal(value1);
		
		setTimeout( function()
		{
			cache.set(url2, value2);
			
			// Has not been overwritten
			expect( cache.get(url1) ).to.eventually.equal(value1);
			
			setTimeout(function(){ done() }, 50);
		
		}, 50);
	});
	
	
	
	it("stripUrlHashes = true", function(done)
	{
		var cache = new UrlCache( options({ stripUrlHashes:true }) );
		var url1 = "http://domain.com/path/to/#hash";
		var url2 = "http://domain.com/path/to/";
		var value1 = "some value";
		var value2 = "another value";
		
		cache.set(url1, value1);
		
		expect( cache.get(url1) ).to.eventually.equal(value1);
		
		setTimeout( function()
		{
			cache.set(url2, value2);
			
			// Has been overwritten
			expect( cache.get(url1) ).to.eventually.equal(value2);
			
			setTimeout(function(){ done() }, 50);
		
		}, 50);
	});
});
