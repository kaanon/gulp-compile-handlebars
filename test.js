'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var template = require('./index.js');

it('should compile Handlebars templates', function (cb) {
	var data = {
		people: ['foo', 'bar']
	};

	var options = {
		templates: 'test/templates',
		data: 'test/data',
		partials: 'test/partials',
		helpers: 'test/helpers'
	};

	var stream = template(data, options);

	stream.on('data', function (data) {
		assert.equal(data.contents.toString(), '<header/><li>foo</li><li>bar</li> baz');
		cb();
	});

	stream.write(new gutil.File({
		path: 'test/test.handlebars',
		contents: new Buffer('{{> header}}{{#each people}}<li>{{.}}</li>{{/each}} {{toLower message}}')
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
