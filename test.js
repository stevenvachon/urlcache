"use strict";
const {describe, it} = require("mocha");
const {expect} = require("chai").use( require("chai-as-promised") );
const {URL} = require("universal-url");
const URLCache = require("./");



function options(overrides)
{
	return Object.assign
	(
		{
			carefulProfile: URLCache.DEFAULT_OPTIONS.carefulProfile,
			commonProfile:  URLCache.DEFAULT_OPTIONS.commonProfile,
			maxAge: Infinity,
			profile: "common"
		},
		overrides
	);
}



describe("DEFAULT_OPTIONS", function()
{
	it("is publicly available", function()
	{
		expect( URLCache.DEFAULT_OPTIONS ).to.be.an("object");

		const originalValue = URLCache.DEFAULT_OPTIONS;

		expect(() => URLCache.DEFAULT_OPTIONS = "changed").to.throw(Error);
		expect(() => URLCache.DEFAULT_OPTIONS.careful = "changed").to.throw(Error);
		expect(URLCache.DEFAULT_OPTIONS).to.equal(originalValue);
	});
});



describe("has()", function()
{
	it("determines if a value exists", function()
	{
		const cache = new URLCache( options() );
		let url1 = "http://some-url";
		let url2 = "http://another-url";

		// Sets internal value
		cache.ages[url1] = Infinity;
		cache.ages[url2] = Infinity;
		cache.values[url1] = 1;
		cache.values[url2] = 2;

		url1 = new URL(url1);
		url2 = new URL(url2);

		expect( cache.has(url1) ).to.be.true;
		expect( cache.has(url2) ).to.be.true;
	});



	it("determines if no value exists", function()
	{
		const cache = new URLCache( options() );
		const url1 = new URL("http://some-url");
		const url2 = new URL("http://another-url");

		expect( cache.has(url1) ).to.be.false;
		expect( cache.has(url2) ).to.be.false;
	});



	it("rejects non-URL keys", function()
	{
		const cache = new URLCache( options() );
		expect(() => cache.has("url")).to.throw(TypeError);
		expect(() => cache.has({})).to.throw(TypeError);
	});
});



describe("get()", function()
{
	it("gets a value", function()
	{
		const cache = new URLCache( options() );
		let url1 = "http://some-url";
		let url2 = "http://another-url";

		// Sets internal value
		cache.ages[url1] = Infinity;
		cache.ages[url2] = Infinity;
		cache.values[url1] = 1;
		cache.values[url2] = undefined;

		url1 = new URL(url1);
		url2 = new URL(url2);

		expect( cache.get(url1) ).to.equal(1);
		expect( cache.get(url2) ).to.be.undefined;
	});



	it("gets no value if none exists", function()
	{
		const cache = new URLCache( options() );
		const url1 = new URL("http://some-url");
		const url2 = new URL("http://another-url");

		expect( cache.get(url1) ).to.be.undefined;
		expect( cache.get(url2) ).to.be.undefined;
	});



	it("rejects non-URL keys", function()
	{
		const cache = new URLCache( options() );
		expect(() => cache.get("url")).to.throw(TypeError);
		expect(() => cache.get({})).to.throw(TypeError);
	});



	it("supports values containing Promises", function()
	{
		const cache = new URLCache( options() );
		let url1 = "http://some-url";
		let url2 = "http://another-url";
		let value1 = new Promise(function(resolve,reject){ setImmediate(() => resolve(1) ) });
		let value2 = new Promise(function(resolve,reject){ setImmediate(() => reject()   ) });

		// Sets internal value
		cache.ages[url1] = Infinity;
		cache.ages[url2] = Infinity;
		cache.values[url1] = value1;
		cache.values[url2] = value2;

		url1 = new URL(url1);
		url2 = new URL(url2);

		expect( cache.get(url1) ).to.eventually.equal(1);
		expect( cache.get(url2) ).to.be.rejected;
	});
});



// NOTE :: option overrides are tested in "options" area
describe("set()", function()
{
	it("sets a value", function()
	{
		const cache = new URLCache( options() );
		const url1 = new URL("http://some-url");
		const url2 = new URL("http://another-url");

		cache.set(url1, "some value");
		cache.set(url2, "another value");

		expect( cache.get(url1) ).to.equal("some value");
		expect( cache.get(url2) ).to.equal("another value");
	});



	it("overwrites a value", function()
	{
		const cache = new URLCache( options() );
		let url1 = new URL("http://some-url");
		let url2 = new URL("http://another-url");
		let value1 = "some value";
		let value2 = "another value";

		cache.set(url1, value1);
		cache.set(url2, value2);
		expect( cache.get(url1) ).to.equal(value1);
		expect( cache.get(url2) ).to.equal(value2);

		value1 = "some other value";
		value2 = "yet another value";

		cache.set(url1, value1);
		cache.set(url2, value2);
		expect( cache.get(url1) ).to.equal(value1);
		expect( cache.get(url2) ).to.equal(value2);
	});



	it("rejects non-URL keys", function()
	{
		const cache = new URLCache( options() );
		expect(() => cache.set("url", "value")).to.throw(TypeError);
		expect(() => cache.set({}, "value")).to.throw(TypeError);
	});
});



describe("delete()", function()
{
	it("removes a key-value pair", function()
	{
		const cache = new URLCache( options() );
		const url1 = new URL("http://some-url");
		const url2 = new URL("http://another-url");

		cache.set(url1, "some value");
		cache.set(url2, "another value");
		cache.delete(url1);
		cache.delete(url2);

		expect( cache.has(url1) ).to.be.false;
		expect( cache.has(url2) ).to.be.false;
	});



	it("rejects non-URL keys", function()
	{
		const cache = new URLCache( options() );
		expect(() => cache.delete("url")).to.throw(TypeError);
		expect(() => cache.delete({})).to.throw(TypeError);
	});
});



describe("clean()", function()
{
	it("removes expired key-value pairs", function()
	{
		const cache = new URLCache( options() );
		const url1 = new URL("http://some-url");
		const url2 = new URL("http://another-url");

		cache.set(url1, "some value");
		cache.set(url2, "another value", { maxAge:-1 });
		cache.clean();

		expect( cache.has(url1) ).to.be.true;
		expect( cache.has(url2) ).to.be.false;
	});
});



describe("clear()", function()
{
	it("removes all key-value pairs", function()
	{
		const cache = new URLCache( options() );
		const url1 = new URL("http://some-url");
		const url2 = new URL("http://another-url");

		cache.set(url1, "some value");
		cache.set(url2, "another value");
		cache.clear();

		expect( cache.has(url1) ).to.be.false;
		expect( cache.has(url2) ).to.be.false;
	});
});



describe("length", function()
{
	it("works", function()
	{
		const cache = new URLCache( options() );

		expect(cache.length).to.equal(0);

		cache.clean();
		expect(cache.length).to.equal(0);

		cache.clear();
		expect(cache.length).to.equal(0);

		cache.delete( new URL("http://not-available") );
		expect(cache.length).to.equal(0);

		cache.set( new URL("http://some-url1"), "some value1");
		expect(cache.length).to.equal(1);

		cache.set( new URL("http://some-url2"), "some value2");
		cache.set( new URL("http://some-url3"), "some value3");
		cache.set( new URL("http://some-url4"), "some value4", { maxAge:-1 });
		expect(cache.length).to.equal(4);

		cache.delete( new URL("http://not-available") );
		expect(cache.length).to.equal(4);

		cache.delete( new URL("http://some-url3") );
		expect(cache.length).to.equal(3);

		cache.clean();
		expect(cache.length).to.equal(2);

		cache.clear();
		expect(cache.length).to.equal(0);
	});
});



describe("options", function()
{
	it("maxAge = 50", function(done)
	{
		const cache = new URLCache( options({ maxAge:50 }) );
		const url = new URL("http://some-url");
		const value = "some value";

		cache.set(url, value);

		expect( cache.has(url) ).to.be.true;
		expect( cache.get(url) ).to.equal(value);
		expect( cache.length ).to.equal(1);

		setTimeout( function()
		{
			expect( cache.has(url) ).to.be.false;
			expect( cache.get(url) ).to.be.undefined;
			expect( cache.length ).to.equal(0);

			cache.set(url, value);

			expect( cache.has(url) ).to.be.true;
			expect( cache.get(url) ).to.equal(value);
			expect( cache.length ).to.equal(1);

			setTimeout( function()
			{
				expect( cache.has(url) ).to.be.false;
				expect( cache.get(url) ).to.be.undefined;
				expect( cache.length ).to.equal(0);
				done();

			}, 100);

		}, 100);
	});



	it("maxAge = 50 (specific override)", function(done)
	{
		const cache = new URLCache( options({ maxAge:500 }) );
		const url = new URL("http://some-url");
		const value = "some value";

		cache.set(url, value, { maxAge:50 });

		expect( cache.has(url) ).to.be.true;
		expect( cache.get(url) ).to.equal(value);
		expect( cache.length ).to.equal(1);

		setTimeout( function()
		{
			expect( cache.has(url) ).to.be.false;
			expect( cache.get(url) ).to.be.undefined;
			expect( cache.length ).to.equal(0);

			cache.set(url, value, { maxAge:50 });

			expect( cache.has(url) ).to.be.true;
			expect( cache.get(url) ).to.equal(value);
			expect( cache.length ).to.equal(1);

			setTimeout( function()
			{
				expect( cache.has(url) ).to.be.false;
				expect( cache.get(url) ).to.be.undefined;
				expect( cache.length ).to.equal(0);
				done();

			}, 100);

		}, 100);
	});



	it(`profile = "common"`, function(done)
	{
		const cache = new URLCache( options() );
		const url1 = new URL("http://domain.com/path/to/index.html?#");
		const url2 = new URL("http://domain.com/path/to/");
		const value1 = "some value";
		const value2 = "another value";

		cache.set(url1, value1);

		expect( cache.get(url1) ).to.equal(value1);

		setTimeout( function()
		{
			cache.set(url2, value2);

			// Has been overwritten
			expect( cache.get(url1) ).to.equal(value2);
			done();

		}, 50);
	});



	it(`profile = "careful"`, function(done)
	{
		const cache = new URLCache( options({ profile:"careful" }) );
		const url1 = new URL("http://domain.com/path/to/index.html?#");
		const url2 = new URL("http://domain.com/path/to/");
		const value1 = "some value";
		const value2 = "another value";

		cache.set(url1, value1);

		expect( cache.get(url1) ).to.equal(value1);

		setTimeout( function()
		{
			cache.set(url2, value2);

			// Has not been overwritten
			expect( cache.get(url1) ).to.equal(value1);
			done();

		}, 50);
	});



	it("carefulProfile = {…}", function(done)
	{
		const cache = new URLCache( options({ profile:"careful", removeHash:false, carefulProfile:{ defaultPorts:{"protocol:":1234} } }) );
		const url_a1 = new URL("protocol://domain.com:1234/path/");
		const url_a2 = new URL("protocol://domain.com/path/");
		const url_b1 = new URL("http://domain.com/#hash");
		const url_b2 = new URL("http://domain.com/");
		const value1 = "some value";
		const value2 = "another value";

		cache.set(url_a1, value1);
		cache.set(url_b1, value1);

		expect( cache.get(url_a1) ).to.equal(value1);
		expect( cache.get(url_b1) ).to.equal(value1);

		setTimeout( function()
		{
			cache.set(url_a2, value2);
			cache.set(url_b2, value2);

			// Has been overwritten
			expect( cache.get(url_a1) ).to.equal(value2);

			// Has not been overwritten
			expect( cache.get(url_b1) ).to.equal(value1);
			expect( cache.get(url_b2) ).to.equal(value2);

			done();

		}, 50);
	});



	it("commonProfile = {…}", function(done)
	{
		const cache = new URLCache( options({ removeHash:false, commonProfile:{ defaultPorts:{"protocol:":1234} } }) );
		const url_a1 = new URL("protocol://domain.com:1234/path/");
		const url_a2 = new URL("protocol://domain.com/path/");
		const url_b1 = new URL("http://domain.com/#hash");
		const url_b2 = new URL("http://domain.com/");
		const value1 = "some value";
		const value2 = "another value";

		cache.set(url_a1, value1);
		cache.set(url_b1, value1);

		expect( cache.get(url_a1) ).to.equal(value1);
		expect( cache.get(url_b1) ).to.equal(value1);

		setTimeout( function()
		{
			cache.set(url_a2, value2);
			cache.set(url_b2, value2);

			// Has been overwritten
			expect( cache.get(url_a1) ).to.equal(value2);

			// Has not been overwritten
			expect( cache.get(url_b1) ).to.equal(value1);
			expect( cache.get(url_b2) ).to.equal(value2);

			done();

		}, 50);
	});
});
