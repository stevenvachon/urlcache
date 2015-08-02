"use strict";
var UrlCache = require("./");

var expect = require("chai").expect;



describe("setting()", function()
{
	it("should contain a url that will be set", function(done)
	{
		var cache = new UrlCache();
		var url = "some url";
		
		cache.setting(url);
		
		expect( cache.contains(url) ).to.be.true;
		done();
	});



	it("should not contain a url that will not be set", function(done)
	{
		var cache = new UrlCache();
		
		cache.setting("some url");
		
		expect( cache.contains("another url") ).to.be.false;
		done();
	});



	it("should contain a url that has been set", function(done)
	{
		var cache = new UrlCache();
		var url = "some url";
		
		cache.setting(url);
		cache.set(url, "some value");
		
		expect( cache.contains(url) ).to.be.true;
		done();
	});



	it("should not contain a url that was cleared specifically", function(done)
	{
		var cache = new UrlCache();
		var url = "some url";
		
		cache.setting(url);
		cache.clear(url);
		
		expect( cache.contains(url) ).to.be.false;
		done();
	});
	
	
	
	it("should not contain a url that was cleared globally", function(done)
	{
		var cache = new UrlCache();
		var url = "some url";
		
		cache.setting(url);
		cache.clear();
		
		expect( cache.contains(url) ).to.be.false;
		done();
	});
});



describe("set()", function()
{
	it("should contain what was set", function(done)
	{
		var cache = new UrlCache();
		var url = "some url";
		
		cache.set(url, "some value");
		
		expect( cache.contains(url) ).to.be.true;
		done();
	});
	
	
	
	it("should get what was set", function(done)
	{
		var cache = new UrlCache();
		var url = "some url";
		var value = "some value";
		
		cache.set(url, value);
		cache.get(url, function(getValue)
		{
			expect(getValue).to.equal(value);
			done();
		});
	});
	
	
	
	it("should overwrite a value", function(done)
	{
		var cache = new UrlCache();
		var url = "some url";
		var value = "some value";
		
		cache.set(url, value);
		cache.get(url, function(getValue)
		{
			expect(getValue).to.equal(value);
		});
		
		value = "another value";
		
		cache.set(url, value);
		cache.get(url, function(getValue)
		{
			expect(getValue).to.equal(value);
			done();
		});
	});



	it("should not contain nor get a url that was cleared specifically", function(done)
	{
		var cache = new UrlCache();
		var url = "some url";
		
		cache.set(url, "some value");
		cache.clear(url);
		
		cache.get(url, function(getValue)
		{
			expect(getValue).to.be.undefined;
		});
		
		expect( cache.contains(url) ).to.be.false;
		done();
	});
	
	
	
	it("should not contain nor get a url that was cleared globally", function(done)
	{
		var cache = new UrlCache();
		var url = "some url";
		
		cache.set(url, "some value");
		cache.clear();
		
		cache.get(url, function(getValue)
		{
			expect(getValue).to.be.undefined;
		});
		
		expect( cache.contains(url) ).to.be.false;
		done();
	});
	
	
	
	// TODO :: exiryTime?
});



describe("get()", function()
{
	it("should get a value when it has been set", function(done)
	{
		var cache = new UrlCache();
		var success = false;
		var url = "some url";
		var value = "some value";
		
		cache.setting(url);
		
		cache.get(url, function(getValue)
		{
			expect(getValue).to.equal(value);
			
			success = true;
		});
		
		expect(success).to.be.false;
		
		cache.set(url, value);
		
		expect(success).to.be.true;
		done();
	});



	it("should not be overwritten by setting()", function(done)
	{
		var cache = new UrlCache();
		var success = false;
		var url = "some url";
		var value = "some value";
		
		function callback(getValue)
		{
			expect(getValue).to.equal(value);
			
			success = true;
		}
		
		cache.get(url, function(getValue)
		{
			expect(getValue).to.be.undefined;
		});
			
		cache.setting(url);
		
		cache.set(url, value);
		cache.get(url, callback);
		
		expect(success).to.be.true;
		
		cache.setting(url);
		cache.get(url, callback);
		
		done();
	});
});



describe("Expirations", function()
{
	it("should not contain nor get a url that has expired specifically", function(done)
	{
		var cache = new UrlCache();
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
	
	
	
	it("should not contain nor get a url that has expired globally", function(done)
	{
		var cache = new UrlCache({ expiryTime:50 });
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
});



// TODO :: normalizeUrls, stripUrlHashes
