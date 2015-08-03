"use strict";
var UrlCache = require("./");

var expect = require("chai").expect;
var objectAssign = require("object-assign");
var urllib = require("url");



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



describe("setting()", function()
{
	it("should contain a url that will be set", function(done)
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		
		cache.setting(url1);
		cache.setting(url2);
		
		expect( cache.contains(url1) ).to.be.true;
		expect( cache.contains(url2) ).to.be.true;
		done();
	});



	it("should not contain a url that will not be set", function(done)
	{
		var cache = new UrlCache( options() );
		
		cache.setting("some url");
		cache.setting( urllib.parse("another url") );
		
		expect( cache.contains("some other url") ).to.be.false;
		expect( cache.contains( urllib.parse("yet another url") ) ).to.be.false;
		done();
	});



	it("should contain a url that has been set", function(done)
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		
		cache.setting(url1);
		cache.setting(url2);
		cache.set(url1, "some value");
		cache.set(url2, "another value");
		
		expect( cache.contains(url1) ).to.be.true;
		expect( cache.contains(url2) ).to.be.true;
		done();
	});



	it("should not contain a url that was cleared specifically", function(done)
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		
		cache.setting(url1);
		cache.setting(url2);
		cache.clear(url1);
		cache.clear(url2);
		
		expect( cache.contains(url1) ).to.be.false;
		expect( cache.contains(url2) ).to.be.false;
		done();
	});
	
	
	
	it("should not contain a url that was cleared globally", function(done)
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		
		cache.setting(url1);
		cache.setting(url2);
		cache.clear();
		
		expect( cache.contains(url1) ).to.be.false;
		expect( cache.contains(url2) ).to.be.false;
		done();
	});
});



describe("set()", function()
{
	it("should contain what was set", function(done)
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		
		cache.set(url1, "some value");
		cache.set(url2, "another value");
		
		expect( cache.contains(url1) ).to.be.true;
		expect( cache.contains(url2) ).to.be.true;
		done();
	});
	
	
	
	it("should get what was set", function(done)
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		var value1 = "some value";
		var value2 = "another value";
		
		cache.set(url1, value1);
		cache.set(url2, value2);
		cache.get(url1, function(value)
		{
			expect(value).to.equal(value1);
		});
		cache.get(url2, function(value)
		{
			expect(value).to.equal(value2);
		});
		
		done();
	});
	
	
	
	it("should overwrite a value", function(done)
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		var value1 = "some value";
		var value2 = "another value";
		
		cache.set(url1, value1);
		cache.set(url2, value2);
		cache.get(url1, function(value)
		{
			expect(value).to.equal(value1);
		});
		cache.get(url2, function(value)
		{
			expect(value).to.equal(value2);
		});
		
		value1 = "some other value";
		value2 = "yet another value";
		
		cache.set(url1, value1);
		cache.set(url2, value2);
		cache.get(url1, function(value)
		{
			expect(value).to.equal(value1);
		});
		cache.get(url2, function(value)
		{
			expect(value).to.equal(value2);
		});
		
		done();
	});
	
	
	
	it("should overwrite setting() but not be overwritten by it", function(done)
	{
		var cache = new UrlCache( options() );
		var success1 = false;
		var success2 = false;
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		var value1 = "some value";
		var value2 = "another value";
		
		function callback1(value)
		{
			expect(value).to.equal(value1);
			
			success1 = true;
		}
		function callback2(value)
		{
			expect(value).to.equal(value2);
			
			success2 = true;
		}
			
		cache.setting(url1);
		cache.setting(url2);
		
		cache.set(url1, value1);
		cache.set(url2, value2);
		cache.get(url1, callback1);
		cache.get(url2, callback2);
		
		expect(success1).to.be.true;
		expect(success2).to.be.true;
		
		cache.setting(url1);
		cache.setting(url2);
		cache.get(url1, callback1);
		cache.get(url2, callback2);
		
		done();
	});



	it("should not contain nor get a url that was cleared specifically", function(done)
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		
		cache.set(url1, "some value");
		cache.set(url2, "another value");
		cache.clear(url1);
		cache.clear(url2);
		
		cache.get(url1, function(value)
		{
			expect(value).to.be.undefined;
		});
		cache.get(url2, function(value)
		{
			expect(value).to.be.undefined;
		});
		
		expect( cache.contains(url1) ).to.be.false;
		expect( cache.contains(url2) ).to.be.false;
		done();
	});
	
	
	
	it("should not contain nor get a url that was cleared globally", function(done)
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		
		cache.set(url1, "some value");
		cache.set(url2, "another value");
		cache.clear();
		
		cache.get(url1, function(value)
		{
			expect(value).to.be.undefined;
		});
		cache.get(url2, function(value)
		{
			expect(value).to.be.undefined;
		});
		
		expect( cache.contains(url1) ).to.be.false;
		expect( cache.contains(url2) ).to.be.false;
		done();
	});
	
	
	
	it("expiryTime should work", function(done)
	{
		var cache = new UrlCache( options() );
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		var value1 = "some value";
		var value2 = "another value";
		
		cache.set(url1, value1, 50);
		cache.set(url2, value2, 50);
		
		expect( cache.contains(url1) ).to.be.true;
		expect( cache.contains(url2) ).to.be.true;
		
		setTimeout( function()
		{
			expect( cache.contains(url1) ).to.be.false;
			expect( cache.contains(url2) ).to.be.false;
			
			cache.set(url1, value1, 50);
			cache.set(url2, value2, 50);
			cache.get(url1, function(value)
			{
				expect(value).to.equal(value1);
			});
			cache.get(url2, function(value)
			{
				expect(value).to.equal(value2);
			});
			
			setTimeout( function()
			{
				cache.get(url1, function(value)
				{
					expect(value).to.be.undefined;
				});
				cache.get(url2, function(value)
				{
					expect(value).to.be.undefined;
				});
				
				done();
			
			}, 100);
		
		}, 100);
	});
});



describe("get()", function()
{
	it("should not get a value if not set nor will be set", function(done)
	{
		var cache = new UrlCache( options() );
		var success1 = false;
		var success2 = false;
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		
		cache.get(url1, function(value)
		{
			expect(value).to.be.undefined;
			
			success1 = true;
		});
		cache.get(url2, function(value)
		{
			expect(value).to.be.undefined;
			
			success2 = true;
		});
		
		expect(success1).to.be.true;
		expect(success2).to.be.true;
		done();
	});
	
	
	
	it("should get a value when it has been set", function(done)
	{
		var cache = new UrlCache( options() );
		var success1 = false;
		var success2 = false;
		var url1 = "some url";
		var url2 = urllib.parse("another url");
		var value1 = "some value";
		var value2 = "another value";
		
		cache.setting(url1);
		cache.setting(url2);
		
		cache.get(url1, function(value)
		{
			expect(value).to.equal(value1);
			
			success1 = true;
		});
		cache.get(url2, function(value)
		{
			expect(value).to.equal(value2);
			
			success2 = true;
		});
		
		expect(success1).to.be.false;
		expect(success2).to.be.false;
		
		cache.set(url1, value1);
		cache.set(url2, value2);
		
		expect(success1).to.be.true;
		expect(success2).to.be.true;
		done();
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
		
		expect( cache.contains(url) ).to.be.true;
		
		setTimeout( function()
		{
			expect( cache.contains(url) ).to.be.false;
			
			cache.set(url, value);
			cache.get(url, function(getValue)
			{
				expect(getValue).to.equal(value);
			});
			
			setTimeout( function()
			{
				cache.get(url, function(getValue)
				{
					expect(getValue).to.be.undefined;
				});
				
				done();
			
			}, 100);
		
		}, 100);
	});
	
	
	
	it("expiryTime = 50 (specific override)", function(done)
	{
		var cache = new UrlCache( options({ expiryTime:500 }) );
		var url = "some url";
		var value = "some value";
		
		cache.set(url, value, 50);
		
		expect( cache.contains(url) ).to.be.true;
		
		setTimeout( function()
		{
			expect( cache.contains(url) ).to.be.false;
			
			cache.set(url, value, 50);
			cache.get(url, function(getValue)
			{
				expect(getValue).to.equal(value);
			});
			
			setTimeout( function()
			{
				cache.get(url, function(getValue)
				{
					expect(getValue).to.be.undefined;
				});
				
				done();
			
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
		
		cache.set(url1, "some value");
		cache.set(url2, "another value");
		
		expect( cache.contains(url1) ).to.be.true;
		expect( cache.contains(url2) ).to.be.true;
		
		cache.get(url1, function(value)
		{
			expect(value).to.equal(value1);
		});
		cache.get(url2, function(value)
		{
			expect(value).to.equal(value2);
		});
		
		done();
	});
	
	
	
	it("normalizeUrls = true", function(done)
	{
		var cache = new UrlCache( options({ normalizeUrls:true }) );
		var url1 = "http://domain.com/path/../to/something/../index.html";
		var url2 = "http://domain.com/to/index.html";
		var value1 = "some value";
		var value2 = "another value";
		
		cache.set(url1, "some value");
		cache.set(url2, "another value");
		
		expect( cache.contains(url1) ).to.be.true;
		expect( cache.contains(url2) ).to.be.true;
		
		cache.get(url1, function(value)
		{
			expect(value).to.equal(value2);
		});
		cache.get(url2, function(value)
		{
			expect(value).to.equal(value2);
		});
		
		done();
	});
	
	
	
	it("normalizeUrls = true, defaultPorts = {…}", function(done)
	{
		var cache = new UrlCache( options({ defaultPorts:{protocol:1234}, normalizeUrls:true }) );
		var url1 = "protocol://domain.com:1234/path/to/";
		var url2 = "protocol://domain.com/path/to/";
		var value1 = "some value";
		var value2 = "another value";
		
		cache.set(url1, "some value");
		cache.set(url2, "another value");
		
		expect( cache.contains(url1) ).to.be.true;
		expect( cache.contains(url2) ).to.be.true;
		
		cache.get(url1, function(value)
		{
			expect(value).to.equal(value2);
		});
		cache.get(url2, function(value)
		{
			expect(value).to.equal(value2);
		});
		
		done();
	});
	
	
	
	it("stripUrlHashes = false", function(done)
	{
		var cache = new UrlCache( options() );
		var url1 = "http://domain.com/path/to/#hash";
		var url2 = "http://domain.com/path/to/";
		var value1 = "some value";
		var value2 = "another value";
		
		cache.set(url1, "some value");
		cache.set(url2, "another value");
		
		expect( cache.contains(url1) ).to.be.true;
		expect( cache.contains(url2) ).to.be.true;
		
		cache.get(url1, function(value)
		{
			expect(value).to.equal(value1);
		});
		cache.get(url2, function(value)
		{
			expect(value).to.equal(value2);
		});
		
		done();
	});
	
	
	
	it("stripUrlHashes = true", function(done)
	{
		var cache = new UrlCache( options({ stripUrlHashes:true }) );
		var url1 = "http://domain.com/path/to/#hash";
		var url2 = "http://domain.com/path/to/";
		var value1 = "some value";
		var value2 = "another value";
		
		cache.set(url1, "some value");
		cache.set(url2, "another value");
		
		expect( cache.contains(url1) ).to.be.true;
		expect( cache.contains(url2) ).to.be.true;
		
		cache.get(url1, function(value)
		{
			expect(value).to.equal(value2);
		});
		cache.get(url2, function(value)
		{
			expect(value).to.equal(value2);
		});
		
		done();
	});
});
