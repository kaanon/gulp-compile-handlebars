var gutil = require('gulp-util');
var through = require('through2');
var Handlebars = require('handlebars');
var fs = require('fs');
var path = require("path");

module.exports = function (data, opts) {

	var options = opts || {};
	//Go through a partials object
	if(options.partials){
		for(var p in options.partials){
			Handlebars.registerPartial(p, options.partials[p]);
		}
	}
	//Go through a helpers object
	if(options.helpers){
		for(var h in options.helpers){
			Handlebars.registerHelper(h, options.helpers[h]);
		}
	}

	// Do not search for more than 10 nestings
	var maxDepth = 10;
	// Process only files with given extension names
	var allowedExtensions = ['hb', 'hbs', 'handlebars', 'html'];

	/**
	 * Searching partials recursively
	 * @method mocksearchDirForPartialsPartials
	 * @param  {string}     dir directory
	 * @param  {string}     registrationDir short directory for registering partial
	 */
	var searchDirForPartials = function(dir, registrationDir, depth) {
		if (depth > maxDepth) {
			return;
		}

		var filenames = fs.readdirSync(dir);

		filenames.forEach(function (filename) {
			var stats = fs.statSync(dir + '/' + filename);

			// If directory, go recursive
			if (stats && stats.isDirectory()) {
				searchDirForPartials(dir + '/' + filename, registrationDir + '/' + filename, depth + 1);
			} else {
				// register only files with hb, hbs or handlebars
				if (allowedExtensions.indexOf(filename.split('.').pop()) !== -1) {
					var name = filename.substr(0, filename.lastIndexOf('.'));

					var template = fs.readFileSync(dir + '/' + filename, 'utf8');
					Handlebars.registerPartial(registrationDir + '/' + name, template);
					// console.log('Registered:', registrationDir + '/' + name)
				}
			}
		});
	};


	// Go through a partials directory array
	if(options.batch){
		// Allow single string
		if(typeof options.batch === 'string') options.batch = [options.batch];

		options.batch.forEach(function (piece) {
			searchDirForPartials(piece, piece.split('/').pop(), 0);
		});
	}

	/**
	 * For handling unknown partials
	 * @method mockPartials
	 * @param  {string}     content Contents of handlebars file
	 */
	var mockPartials = function(content){
		var regex = /{{> (.*)}}/gim, match, partial;
		if(content.match(regex)){
			while((match = regex.exec(content)) !== null){
				partial = match[1];
				//Only register an empty partial if the partial has not already been registered
				if(!Handlebars.partials.hasOwnProperty(partial)){
					Handlebars.registerPartial(partial, '');
				}
			}
		}
	};

	// options: 
	// ```
	//	helpersAtPathMap: {
	//		'helpers': './src/js/hbs-helpers/'
	//	}
	// {{@helpers/slugify.helper
	// {{#@helpers/include.helper}}...{{/helpers/include.helper}}
	var registerAtPathHelpers = function(content, basePathMap) 
	{
		var includeHelpersRegex = /{{@([a-zA-Z-0-9\.\/\~]+)/g;
		var includeBlockHelpersRegex = /{{#@([a-zA-Z-0-9\.\/\~]+)/g;
		var closingIncludeBlockHelpers = /{{\/([a-zA-Z-0-9\.\/\~]+)/g;


		// replace internal requires with helper form
		var sanitize = function(name) {
			return name.replace('/', '-').replace('.', '').replace('~', '_');
		};

		// Grab all of the helpers out of the template
		var helpers = [];
		// Work out the normal helpers
		content = content.replace(includeHelpersRegex, function(match, dep) {
			helpers.push(dep);
			return '{{' + sanitize(dep);
		});
		// Work out the block helpers
		content = content.replace(includeBlockHelpersRegex, function(match, dep) {
			var helperId = dep;
			helpers.push(helperId);
			return '{{#' + sanitize(helperId);
		});
		// Work out closing to the block helper {{/helper}}
		content = content.replace(closingIncludeBlockHelpers, function(match, dep) {
			return '{{/' + sanitize(dep);
		});

		var arrayUnique = function(a) {
			return a.reduce(function(p, c) {
				if (p.indexOf(c) < 0) p.push(c);
				return p;
			}, []);
		};

		// No repeats (because it is unnecessary)
		helpers = arrayUnique(helpers);

		// We can only
		if(Object.keys(basePathMap).length > 0)
		{
			// Register the helpers
			for (var i = 0; i < helpers.length; i++)
			{
				var helperPath = helpers[i];

				// Replace any defined module names with the appropriate relative paths
				Object.keys(basePathMap).forEach(function(mapKey, index, array) {
					var basePath = basePathMap[mapKey];
					helperPath = helperPath.replace(new RegExp("^(" + mapKey + ")/"), basePath);
				});

				// Turn the path from relative from the calling file to absolute
				helperPath = path.resolve(process.cwd(), helperPath);
				if (process.platform === "win32") {
					// Switch backslash to forward slash
					helperPath = helperPath.replace(/\\/g, "/");
				}


				var helperFunc = null;
				try {
					// Try to get the helper function
					helperFunc = require(helperPath);
				} catch(e) {

				}
				if(helperFunc !== null)
				{
					// Actually register the helper, if we could find it
					Handlebars.registerHelper(sanitize(helpers[i]), helperFunc);
				}
			}
		}

		return content;
	};


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
			var fileContents = file.contents.toString();
			if(options.ignorePartials){
				mockPartials(fileContents);
			}
			fileContents = registerAtPathHelpers(fileContents, options.helpersAtPathMap || {});

			var template = Handlebars.compile(fileContents);
			file.contents = new Buffer(template(data));
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-compile-handlebars', err));
		}

		this.push(file);
		cb();
	});
};
