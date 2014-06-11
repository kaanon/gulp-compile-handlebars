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
				var template = fs.readFileSync(dir + path.sep + filename, 'utf8');
				console.log(name, filename);
				if(context) {
					fn.call(context, name, template);
				} else {
					fn(name, template);
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

	// // Go through a partials object
	// if (options.partials) {
	// 	for (var p in options.partials) {
	// 		Handlebars.registerPartial(p, options.partials[p]);
	// 	}
	// }

	// // Go through a helpers object
	// if (options.helpers) {
	// 	for (var h in options.helpers) {
	// 		Handlebars.registerHelper(h, options.helpers[h]);
	// 	}
	// }

	// // Go through a partials directory array
	// if (options.batch) {
	// 	// Allow single string
	// 	if (typeof options.batch === 'string') {
	// 		options.batch = [options.batch];
	// 	}

	// 	options.batch.forEach(function (b) {
	// 		var filenames = fs.readdirSync(b);

	// 		filenames.forEach(function (filename) {
	// 			// Needs a better name extractor (maybe with the path module)

	// 			var name = filename.split('.')[0];
	// 			// Don't allow hidden files
	// 			if (!name.length) {
	// 				return;
	// 			}
	// 			var template = fs.readFileSync(b + '/' + filename, 'utf8');
	// 			Handlebars.registerPartial(b.split('/')
	// 				.pop() + '/' + name, template);
	// 		});
	// 	});
	// }


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
					var dataPath = process.cwd() + path.sep + options.data + path.sep;
					jsonFile = dataPath + path.basename(gutil.replaceExtension(file.path, '.json'));
					yamlFile = dataPath + path.basename(gutil.replaceExtension(file.path, '.yaml'));
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
