# gulp-compile-handlebars
Forked from [gulp-template](https://github.com/sindresorhus/gulp-template)
Inspired by [grunt-compile-handlebars](https://github.com/patrickkettner/grunt-compile-handlebars)

> Compile [Handlebars templates](http://www.handlebarsjs.com/)

## Install

Install with [npm](https://npmjs.org/package/gulp-compile-handlebars)

```
npm install --save-dev gulp-compile-handlebars
```


## Example

### `src/hello.handlebars`

```handlebars
{{> partials/header}}
<p>Hello {{firstName}}</p>
<p>HELLO! {{capitals firstName}}</p>
{{> footer}}
```

### `src/partials/header.handlebars`

```handlebars
<h1>Header</h1>
```

### `gulpfile.js`

```js
var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');

gulp.task('default', function () {
	var templateData = {
		firstName: 'Kaanon'
	},
	options = {
		ignorePartials: true, //ignores the unknown footer2 partial in the handlebars template, defaults to false
		partials : {
			footer : '<footer>the end</footer>'
		},
		batch : ['./src/partials'],
		helpers : {
			capitals : function(str){
				return str.toUpperCase();
			}
		}
	}

	return gulp.src('src/hello.handlebars')
		.pipe(handlebars(templateData, options))
		.pipe(rename('hello.html'))
		.pipe(gulp.dest('dist'));
});
```

### `dist/hello.html`

```html
<h1>Header</h1>
<p>Hello Kaanon</p>
<p>HELLO! KAANON</p>
<footer>the end</footer>
```


## Example: inline `@/at` helpers

### `src/hello.handlebars`

```handlebars
<p>Hello {{firstName}}</p>
<p>HELLO! {{@helpers/capitals.helper firstName}}</p>
{{#@helpers/noop.helper}}
	<p>A block helper that invokes the block as though no helper existed.</p>
{{/helpers/noop}}
{{> footer}}
```

### `src/js/hbs-helpers/capitals.helper.js`

```js
module.exports = function(str) {
    return str.toUpperCase();
}
```

### `src/js/hbs-helpers/noop.helper.js`

```js
module.exports = function(options) {
	return options.fn(this);
}
```


### `gulpfile.js`

```js
var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');

gulp.task('default', function () {
	var templateData = {
		firstName: 'Kaanon'
	},
	options = {
		ignorePartials: true,
		partials : {
			footer : '<footer>the end</footer>'
		},
		helpersAtPathMap: {
			'helpers': './src/js/hbs-helpers/'
		},
	}

	return gulp.src('src/hello.handlebars')
		.pipe(handlebars(templateData, options))
		.pipe(rename('hello.html'))
		.pipe(gulp.dest('dist'));
});
```

### `dist/hello.html`

```html
<p>Hello Kaanon</p>
<p>HELLO! KAANON</p>
<p>A block helper that invokes the block as though no helper existed.</p>
<footer>the end</footer>
```


## Example: Using `module.exports.compile`:

This module also exports `compile` which works exactly the same except returns the compiled template instead of a gulp stream.

*Supports `@/at` helper syntax*

```
var handlebars = require('gulp-compile-handlebars');

var handlebarsCompileOptions = {};

handlebars.compile(source, context, handlebarsCompileOptions);
```

## Options

- __ignorePartials__ : ignores any unknown partials. Useful if you only want to handle part of the file
- __partials__ : Javascript object that will fill in partials using strings
- __batch__ : Javascript array of filepaths to use as partials
- __helpers__: Javascript functions to stand in for helpers used in the handlebars files
- __helpersAtPathMap__: Javascript object that maps module names to paths. Used for inline `@/at` helpers in handlebars templates. ex. `{{@helpers/myhelper ...}}` or `{{#@helpers/myblockhelper ...}}{{/helpers/myblockhelper ...}}`

## License

[MIT](http://opensource.org/licenses/MIT) © [Kaanon MacFarlane](http://kaanon.com)
