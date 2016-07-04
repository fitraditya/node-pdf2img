# node-pdf2img

A nodejs module for converting pdf into image file

## Installation
```
  $ [sudo] npm install pdf2img
```

## Usage

```javascript
var fs      = require('fs');
var pdf2img = require('pdf2img');

var input   = __dirname + '/sweetdocument.pdf';

pdf2img.setOptions({
  type: 'png',                      // png or jpeg, default png
  size: 1024,                       // default 1024
  density: 600,                     // default 600
  outputdir: __dirname + '/output', // mandatory, outputdir must be absolute path
  targetname: 'test'                // the prefix for the generated files, optional
});

pdf2img.convert(input, function(err, info) {
  if (err) console.log(err)
  else console.log(info);
});
```

It will return array of splitted and converted image files.

```javascript
[ { page: 1,
    name: 'test_1.png',
    path: '/path-to-your-project/output/test_1.png' },
  { page: 2,
    name: 'test_2.png',
    path: '/path-to-your-project/output/test_2.png' },
  { page: 3,
    name: 'test_3.png',
    path: '/path-to-your-project/output/test_3.png' } ]
```

Note that pdf2img will split and convert all pages.

## To Do
* Convert selected pages

## Maintainer
[Fitra Aditya][0]

## License
MIT

[0]: https://github.com/fitraditya
