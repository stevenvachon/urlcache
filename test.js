"use strict";
var UrlCache = require("./");

var expect = require("chai").expect;



describe("setting()", function()
{
	it("should report that it is retrieving", function()
	{
		var cache = new UrlCache();
		var url = "some url";

		cache.setting(url);

		expect( cache.isSetting(url) ).to.be.true;
	});



	it("should report that it is not retrieving", function()
	{
		var cache = new UrlCache();
		var url = "some url";

		cache.setting(url);

		expect( cache.isSetting("another url") ).to.be.false;
	});



	it("should not report that it is retrieving after being stored", function()
	{
		var cache = new UrlCache();
		var url = "some url";

		cache.setting(url);
		cache.set(url, "something");

		expect( cache.isSetting(url) ).to.be.false;
	});



	it("should be cleared", function()
	{
		var cache = new UrlCache();
		var url = "some url";

		cache.setting(url);
		cache.clear();

		expect( cache.isSetting(url) ).to.be.false;
	});
});



describe("set()", function()
{
	it("should get what was stored", function()
	{
		var cache = new UrlCache();
		var response = "some response";
		var url = "some url";

		cache.set(url, response);

		expect( cache.get(url) ).to.equal(response);
	});



	it("should contain what was stored", function()
	{
		var cache = new UrlCache();
		var url = "some url";

		cache.set(url, "anything");

		expect( cache.contains(url) ).to.be.true;
	});



	it("should be cleared", function()
	{
		var cache = new UrlCache();
		var url = "some url";

		cache.set(url, "anything");
		cache.clear();

		expect( cache.get(url) ).to.equal(undefined);
		expect( cache.contains(url) ).to.be.false;
	});
});



describe("getWhenSet()", function()
{
	it("should run the callback function after cache is stored", function()
	{
		var cache = new UrlCache();
		var response = "some response";
		var success = false;
		var url = "some url";

		cache.getWhenSet(url, function(callbackResponse)
		{
			expect(callbackResponse).to.equal(response);

			success = true;
		});

		expect(success).to.be.false;

		cache.set(url, response);

		expect(success).to.be.true;
	});



	it("should not be overwritten by setting retrieval", function()
	{
		var cache = new UrlCache();
		var response = "some response";
		var success = false;
		var url = "some url";

		cache.getWhenSet(url, function(callbackResponse)
		{
			expect(callbackResponse).to.equal(response);

			success = true;
		});
					
		cache.setting(url);
		cache.set(url, response);

		expect(success).to.be.true;
	});
});
