# [gulp](https://github.com/wearefractal/gulp)-compile-handlebars

> Compile [Handlebars templates](http://www.handlebarsjs.com/)

## New in this fork

In this fork, the focus is to make it dead simple to build static website using handlebars, in a well structured project.

It means that it is pretty opinionated as to how you should organised your files. 

The project structure that is working for me looks like this :

```
|-src
|---data
|-----en
|-----fr
|---helpers
|---partials
|---templates
|-----en
|-----fr
```

I've taken the example of a multilang website to insist on the fact that the data folder structure should mimic the templates folder structure.

## Install

_Currently:_
`npm install p-j/gulp-compile-handlebars --save-dev`

## Example

```handlebars
{{!-- src/templates/hello.handlebars --}}

<h1>Hello {{firstName}} {{lastName}}</h1>
<h2>HELLO! {{capitals firstName}} {{capitals lastName}}</h2>
{{> footer}}
```

```handlebars
{{!-- src/partials/footer.handlebars --}}

<footer>the end</footer>
```

```javascript
// src/helpers/capitals.js

module.exports.capitals = function (str) {
	return str.toUpperCase();
};
```

```yml
# src/data/hello.yaml

lastName: "Parker"
```

```js
// gulpfile.js

var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');

gulp.task('default', function () {
	var templateData = {
		firstName: 'Jérémie'
	},
	options = {
			templates: 'src/templates',
			data: 'src/data'
			partials : 'src/partials',
			helpers : 'src/helpers'
		}
	}

	return gulp.src(['src/templates/*.handlebars'])
		.pipe(handlebars(templateData, options))
		.pipe(rename('hello.html'))
		.pipe(gulp.dest('dist'));
});
```

Result:
```html
<!-- dist/hello.html -->
<h1>Hello Jérémie Parker</h1>
<h2>HELLO! JÉRÉMIE PARKER</h2>
<footer>the end</footer>
```

## License
Based on [Kaanon MacFarlane](http://kaanon.com) works which was itself base on [Sindre Sorhus](http://sindresorhus.com)'s.

[MIT](http://opensource.org/licenses/MIT) © [Jérémie Parker](http://jeremie-parker.com)
