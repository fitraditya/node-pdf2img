"use strict";

var fs = require('fs');
var gm = require('gm');
var path = require('path');
var async = require('async');

var options = {
  type: 'png',
  size: 1024,
  density: 600,
  outputdir: null,
  targetname: null
};

var Pdf2Img = function () {
};

Pdf2Img.prototype.setOptions = function (opts) {
  options.type = opts.type || options.type;
  options.size = opts.size || options.size;
  options.density = opts.density || options.density;
  options.outputdir = opts.outputdir || options.outputdir;
  options.targetname = opts.targetname || options.targetname;
};

Pdf2Img.prototype.convert = function (file, callbackreturn) {
  async.waterfall([
    function (callback) {
      fs.stat(file, function (error, result) {
        if (error) callback('[Error: File not found]', null);
        else {
          if (!fs.existsSync(options.outputdir)) {
            fs.mkdirSync(options.outputdir);
          }
          if (!options.targetname) {
            options.targetname = path.basename(file, path.extname(path.basename(file)));
          }
          callback(null, file);
        }
      });
    },

    function (input, callback) {
      var cmd = 'identify -format %n ' + input;
      var execSync = require('child_process').execSync;
      var pageCount = parseInt(execSync(cmd).toString().trim());
      callback(null, pageCount)
    },

    function (pageCount, callback) {
      var pages = [];
      if (!pageCount)
        callback('[Error: Invalid page number]', null);

      for (var i = 1; i <= pageCount; i++) {
        pages.push(i);

        if (i == pageCount) callback(null, pages);
      }
    },

    function (pages, callback) {
      async.map(pages, function (page, callbackmap) {
        var inputStream = fs.createReadStream(file);
        var outputStream = fs.createWriteStream(options.outputdir + '/' + options.targetname + '_' + page + '.' + options.type);
        convertPdf2Img(inputStream, outputStream, page, function (error, result) {
          if (!error) {
            result.page = page;
          }

          callbackmap(error, result);
        });
      }, callback);
    }
  ], callbackreturn);
};

var convertPdf2Img = function (input, output, page, callback) {
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

  output.on('error', function (error) {
    callback(error, null);
  });

  result.on('error', function (error) {
    callback(error, null);
  });

  result.on('data', function (data) {
    datasize = data.length;
  });

  result.on('end', function () {
    var results = {
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
