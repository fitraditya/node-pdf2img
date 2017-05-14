"use strict";

var fs      = require('fs');
var path    = require('path');
var expect  = require('chai').expect();
var should  = require('chai').should();
var pdf2img = require('../index.js');

var input   = __dirname + path.sep + 'test.pdf';

pdf2img.setOptions({
  outputdir: __dirname + path.sep + '/output',
  outputname: 'test'
});

describe('Split and convert pdf into images', function() {
  it ('Create jpg files', function(done) {
    this.timeout(100000);
    pdf2img.convert(input, function(err, info) {
      if (info.result !== 'success') {
        info.result.should.equal('success');
        done();
      } else {
        var n = 1;
        info.message.forEach(function(file) {
          file.page.should.equal(n);
          file.name.should.equal('test_' + n + '.jpg');
          isFileExists(file.path).should.to.be.true;
          if (n === 3) done();
          n++;
        });
      }
    });
  });
  it ('Create png files', function(done) {
    this.timeout(100000);
    pdf2img.setOptions({ type: 'png' });
    pdf2img.convert(input, function(err, info) {
      if (info.result !== 'success') {
        info.result.should.equal('success');
        done();
      } else {
        var n = 1;
        info.message.forEach(function(file) {
          file.page.should.equal(n);
          file.name.should.equal('test_' + n + '.png');
          isFileExists(file.path).should.to.be.true;
          if (n === 3) done();
          n++;
        });
      }
    });
  });
});

var isFileExists = function(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    return false;
  }
}
