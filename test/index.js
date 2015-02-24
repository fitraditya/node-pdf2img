var fs      = require('fs');
var should  = require('chai').should();
var pdf2img = require('../');

var input   = __dirname + '/test.pdf';

pdf2img.setOptions({ outputdir: __dirname + '/output' });

describe('Split and covert pdf into images', function() {
  it ('Create png files', function(done) {
    this.timeout(30000);
    pdf2img.convert(input, function(info) {
      n = 1;
      info.forEach(function(file) {
        file.page.should.equal(n);
        file.name.should.equal('test_' + n + '.png');
        if (n === 3) done();
        n++;
      });
    });
  });
  it ('Create jpg files', function(done) {
    this.timeout(30000);
    pdf2img.setOptions({ type: 'jpg' });
    pdf2img.convert(input, function(info) {
      n = 1;
      info.forEach(function(file) {
        file.page.should.equal(n);
        file.name.should.equal('test_' + n + '.jpg');
        if (n === 3) done();
        n++;
      });
    });
  });
});