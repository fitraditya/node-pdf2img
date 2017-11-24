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
  it ('Create jpg file only for given page', function(done) {
    this.timeout(100000);
    pdf2img.setOptions({ type: 'jpg', page: 1 });
    pdf2img.convert(input, function(err, info) {
      if (info.result !== 'success') {
        info.result.should.equal('success');
        done();
      } else {
        info.message.length.should.equal(1)
        var file = info.message[0];
        file.page.should.equal(1);
        file.name.should.equal('test_1.jpg');
        isFileExists(file.path).should.to.be.true;
        done();
      }
    });
  });
  it ('Create png file only for given page', function(done) {
    this.timeout(100000);
    pdf2img.setOptions({ type: 'png', page: 2 });
    pdf2img.convert(input, function(err, info) {
      if (info.result !== 'success') {
        info.result.should.equal('success');
        done();
      } else {
        info.message.length.should.equal(1)
        var file = info.message[0];
        file.page.should.equal(2);
        file.name.should.equal('test_2.png');
        isFileExists(file.path).should.to.be.true;
        done();
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
