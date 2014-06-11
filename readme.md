# [gulp](https://github.com/wearefractal/gulp)-compile-handlebars

> Compile [Handlebars templates](http://www.handlebarsjs.com/)

## Install

_Soon_

## Example

### `src/hello.handlebars`

```erb
<h1>Hello {{firstName}} {{lastName}}</h1>
<h2>HELLO! {{capitals firstName}} {{capitals lastName}}</h2>
{{> footer}}
```

### `src/partials/footer.handlebars`

```erb
<footer>the end</footer>
```

### `src/helpers/capitals.js`

```javascript
function(str){
	return str.toUpperCase();
}
```

### `src/data/hello.json`

```json
{
	"lastName": "Parker"
}
```

### `gulpfile.js`

```js
var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');

gulp.task('default', function () {
	var templateData = {
		firstName: 'Jérémie'
	},
	options = {
			data: 'src/data'
			partials : 'src/partials',
			helpers : 'src/helpers'
		}
	}

	return gulp.src('src/*.handlebars')
		.pipe(handlebars(templateData, options))
		.pipe(rename('hello.html'))
		.pipe(gulp.dest('dist'));
});
```

### `dist/hello.html`

```html
<h1>Hello Jérémie Parker</h1>
<h2>HELLO! JÉRÉMIE PARKER</h2>
<footer>the end</footer>
```

## License

MIT © [Kaanon MacFarlane](http://kaanon.com) & [Jérémie PARKER](http://jeremie-parker.com)
