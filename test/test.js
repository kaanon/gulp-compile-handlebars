'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var template = require('../index');

it('should compile Handlebars templates', function (cb) {
	var stream = template(
	{
		people: ['foo', 'bar'],
		message: 'BAZ'
	},
	{
		partials : { header : '<header/>' },
		helpers : { toLower : function(str) { return str.toLowerCase(); } }
	});

	stream.on('data', function (data) {
		assert.equal(data.contents.toString(), '<header/><li>foo</li><li>bar</li> baz');
		cb();
	});

	stream.write(new gutil.File({
		contents: new Buffer('{{> header}}{{#each people}}<li>{{.}}</li>{{/each}} {{toLower message}}')
	}));

	stream.end();
});

it('should compile Handlebars templates, and ignore unknown partials', function (cb) {
	var stream = template(
	{
		people: ['foo', 'bar'],
		message: 'BAZ'
	},
	{
		ignorePartials : true,
		helpers : { toLower : function(str) { return str.toLowerCase(); } }
	});

	stream.on('data', function (data) {
		assert.equal(data.contents.toString(), '<header/><li>foo</li><li>bar</li> baz');
		cb();
	});

	stream.write(new gutil.File({
		contents: new Buffer('{{> header}}{{#each people}}<li>{{.}}</li>{{/each}} {{toLower message}}')
	}));

	stream.end();
});

it('should compile Handlebars templates, and use batched partials', function (cb) {
	var stream = template({}, { batch: ['test/partials'] });

	stream.on('data', function (data) {
		assert.equal(data.contents.toString(), 'Header Goes Here');
		cb();
	});

	stream.write(new gutil.File({
		contents: new Buffer('{{> header-test}}')
	}));

	stream.end();
});

it('should compile Handlebars templates, and use batched NESTED partials', function (cb) {
	var stream = template({}, { batch: ['test/partials'] });

	stream.on('data', function (data) {
		assert.equal(data.contents.toString(), 'Mobile Header Goes Here');
		cb();
	});

	stream.write(new gutil.File({
		contents: new Buffer('{{> mobile/header-test}}')
	}));

	stream.end();
});

it('should compile Handlebars templates, and use multiple batched NESTED partials directories', function (cb) {
	var stream = template({}, { batch: ['test/partials/desktop', 'test/partials/mobile'] });

	stream.on('data', function (data) {
		assert.equal(data.contents.toString(), 'Desktop Header Goes Here');
		cb();
	});

	stream.write(new gutil.File({
		contents: new Buffer('{{> desktop/header-test}}')
	}));

	stream.end();
});


it('should compile Handlebars templates with no helpers or partials', function (cb) {
	var stream = template(	{people: ['foo', 'bar']});

	stream.on('data', function (data) {
		assert.equal(data.contents.toString(), '<li>foo</li><li>bar</li>');
		cb();
	});

	stream.write(new gutil.File({
		contents: new Buffer('{{#each people}}<li>{{.}}</li>{{/each}}')
	}));

	stream.end();
});


it('should use file.data if available', function (cb) {
	var stream = template({ foo: 'foo', bar: 'bar' });

	stream.on('data', function (data) {
		assert.equal(data.contents.toString(), '<div>foo BAZ</div>');
		cb();
	});

	var file = new gutil.File({
		contents: new Buffer('<div>{{foo}} {{bar}}</div>')
	});
	file.data = { bar: 'BAZ' };

	stream.write(file);

	stream.end();

});

it('should not require a default data object', function (cb) {
	var stream = template();

	stream.on('data', function (data) {
		assert.equal(data.contents.toString(), '<div>BAZ</div>');
		cb();
	});

	var file = new gutil.File({
		contents: new Buffer('<div>{{foo}}</div>')
	});
	file.data = { foo: 'BAZ' };

	stream.write(file);

	stream.end();

});
