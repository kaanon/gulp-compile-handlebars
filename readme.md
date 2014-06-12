# [gulp](https://github.com/wearefractal/gulp)-compile-handlebars

> Compile [Handlebars templates](http://www.handlebarsjs.com/)

## Install

_Currently:_
`npm install https+git@github.com:p-j/gulp-compile-handlebars.git --save-dev`

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

[MIT](http://opensource.org/licenses/MIT) © [Jérémie PARKER](http://jeremie-parker.com)
