'use strict';
var _      = require('lodash'),
gutil      = require('gulp-util'),
through    = require('through2'),
Handlebars = require('handlebars'),
yaml       = require('js-yaml'),
fs         = require('fs'),
path       = require('path');

module.exports = function (data, opts) {

	var options = opts || {};
	var register = function(directories, fn, context) {
		if(!directories || !_.isFunction(fn)) {
			return;
		}

		if(_.isString(directories)) {
			directories = [directories];
		}

		directories.forEach(function(dir) {
			var filenames = fs.readdirSync(dir);
			filenames.forEach(function (filename) {
				// Don't allow hidden files
				if(filename.indexOf('.') === 0) {
					return;
				}

				var name = path.basename(filename, path.extname(filename));
				var content;
				if(path.extname(filename) === '.js') {
					content = require(path.resolve(dir + path.sep + filename))[name];
				} else {
					content = fs.readFileSync(dir + path.sep + filename, 'utf8');
				}

				if(context) {
					fn.call(context, name, content);
				} else {
					fn(name, content);
				}
			});
		});
	};

	if (options.partials) {
		register(options.partials, Handlebars.registerPartial, Handlebars);
	}

	if (options.helpers) {
		register(options.helpers, Handlebars.registerHelper, Handlebars);
	}

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-compile-handlebars', 'Streaming not supported'));
			return cb();
		}

		try {
			var template = Handlebars.compile(file.contents.toString()),
			jsonFile     = '',
			yamlFile     = '',
			dataFile     = '',
			dataFromFile = {};

			if (options.data) {
				if (_.isString(options.data)) {
					jsonFile = gutil.replaceExtension(file.path.replace(options.templates, options.data), '.json');
					yamlFile = gutil.replaceExtension(file.path.replace(options.templates, options.data), '.yaml');
				} else if(_.isBoolean(options.data)) {
					jsonFile = gutil.replaceExtension(file.path, '.json');
					yamlFile = gutil.replaceExtension(file.path, '.yaml');
				} else {
					throw new Error('options.data should be a string or a boolean');
				}

				if (fs.existsSync(jsonFile)) {
					dataFile = jsonFile;
					dataFromFile = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
				} else if (fs.existsSync(yamlFile)) {
					dataFile = yamlFile;
					dataFromFile = yaml.safeLoad(fs.readFileSync(yamlFile, 'utf8'));
				}
			}

			data = _.extend({}, data, dataFromFile);
			file.contents = new Buffer(template(data));
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-compile-handlebars', err));
		}

		this.push(file);
		cb();
	});
};
