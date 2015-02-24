"use strict";

var fs    = require('fs');
var gm    = require('gm');
var pdf   = require('pdfinfo');
var path  = require('path');
var async = require('async');
var mkdir = require('mkdirp');

var options = {
  type      : 'png',
  size      : 1024,
  density   : 600,
  outputdir : null
};

var Pdf2Img = function() {};

Pdf2Img.prototype.setOptions = function(opts) {
  options.type      = opts.type || options.type;
  options.size      = opts.size || options.size;
  options.density   = opts.density || options.density;
  options.outputdir = opts.outputdir || options.outputdir;
};

Pdf2Img.prototype.convert = function(file, callbackreturn) {
  async.waterfall([
    function(callback) {
      fs.stat(file, function(error, result) {
        if (error) callback('[Error: File not found]', null);
        else {
          var input = fs.createReadStream(file);
          callback(null, input);
        }
      });
    },

    function(input, callback) {
      pdf(input).info(function(error, data) {
        if (error) callback(error, null);
        else callback(null, data);
      });
    },

    function(data, callback) {
      var pages = [];
      if (data.pages === 0 || data.pages === '0')
        callback('[Error: Invalid page number]', null);

      for (var i = 1; i <= data.pages; i++) {
        pages.push(i);

        if (i === data.pages) callback(null, pages);
      }
    },

    function(pages, callback) {
      async.map(pages, function(page, callbackmap) {
        var inputStream = fs.createReadStream(file);
        var outputStream = fs.createWriteStream(options.outputdir + '/test_' + page + '.' + options.type);
        convertPdf2Img(inputStream, outputStream, page, function(error, result) {
          result.page = page;
          callbackmap(null, result);
        });
      }, function(error, results) {
        callback(null, results);
      });
    }
  ], function(error, result) {
    if (error) console.log(error);
    else callbackreturn(result);
  });
};

var convertPdf2Img = function(input, output, page, callback) {
  var datasize = 0;

  if (input.path) {
    var filepath = input.path;
  } else {
    callback('[Error: Invalid file path]', null);
  }

  var filename = filepath + '[' + (page - 1) + ']';

  var result = gm(input, filename)
    .density(options.density, options.density)
    .resize(options.size)
    .stream(options.type);

  output.on('error', function(error) {
    callback(error, null);
  });

  result.on('error', function(error) {
    callback(error, null);
  });

  result.on('data', function(data) {
    datasize = data.length;
  });

  result.on('end', function() {
    if (datasize < 127) {
      callback('[Error: Invalid data size]', null);
    }

    var results  = {
      page: 0,
      name: path.basename(output.path),
      path: output.path
    };

    output.end();
    callback(null, results);
  });

  result.pipe(output);
};

module.exports = new Pdf2Img;