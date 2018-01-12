"use strict";

var fs = require('fs');
var gm = require('gm');
var path = require('path');
var async = require('async');

var options = {
  type: 'jpg',
  size: 1024,
  density: 600,
  outputdir: null,
  outputname: null
};

var Pdf2Img = function() {};

Pdf2Img.prototype.setOptions = function(opts) {
  options.type = opts.type != null || opts.type != 'undefined' ? opts.type : options.type;
  options.size = opts.size != null || opts.size != 'undefined' ? opts.size : options.size;
  options.density = opts.density != null || opts.density != 'undefined' ? opts.density : options.density;
  options.outputdir = opts.outputdir != null || opts.outputdir != 'undefined' ? opts.outputdir : options.outputdir;
  options.outputname = opts.outputname != null || opts.outputname != 'undefined' ? opts.outputname : options.outputname;
};

Pdf2Img.prototype.convert = function(input, callbackreturn) {
  // Make sure it has correct extension
  if (path.extname(path.basename(input)) != '.pdf') {
    return callbackreturn({
      result: 'error',
      message: 'Unsupported file type.'
    });
  }

  // Check if input file exists
  if (!isFileExists(input)) {
    return callbackreturn({
      result: 'error',
      message: 'Input file not found.'
    });
  }

  var stdout = [];
  var output = path.basename(input, path.extname(path.basename(input)));

  // Set output dir
  if (options.outputdir) {
    options.outputdir = options.outputdir + path.sep;
  } else {
    options.outputdir = output + path.sep;
  }

  // Create output dir if it doesn't exists
  if (!isDirExists(options.outputdir)) {
    fs.mkdirSync(options.outputdir);
  }

  // Set output name
  if (options.outputname) {
    options.outputname = options.outputname;
  } else {
    options.outputname = output;
  }

  async.waterfall([
    // Get pages count
    function(callback) {
      var cmd = 'gm identify -format "%p " "' + input + '"';
      var execSync = require('child_process').execSync;
      var pageCount = execSync(cmd).toString().match(/[0-9]+/g);

      if (!pageCount.length) {
        callback({
          result: 'error',
          message: 'Invalid page number.'
        }, null);
      }

      callback(null, pageCount);
    },

    // Convert pdf file
    function(pages, callback) {
      // Use eachSeries to make sure that conversion has done page by page
      async.eachSeries(pages, function(page, callbackmap) {
        var inputStream = fs.createReadStream(input);
        var outputFile = options.outputdir + options.outputname + '_' + page + '.' + options.type;

        convertPdf2Img(inputStream, outputFile, parseInt(page), function(error, result) {
          if (error) {
            callbackmap(error);
          }

          stdout.push(result);
          callbackmap(error, result);
        });
      }, function(e) {
        if (e) callback(e);

        callback(null, {
          result: 'success',
          message: stdout
        });
      });
    }
  ], callbackreturn);
};

var convertPdf2Img = function(input, output, page, callback) {
  if (input.path) {
    var filepath = input.path;
  } else {
    callback({
      result: 'error',
      message: 'Invalid input file path.'
    }, null);
  }

  var filename = filepath + '[' + (page - 1) + ']';

  gm(input, filename)
    .density(options.density, options.density)
    .resize(options.size)
    .quality(100)
    .write(output, function(err) {
      if (err) {
        callback({
          result: 'error',
          message: 'Can not write output file.'
        }, null);
      }

      if (!(fs.statSync(output)['size'] / 1000)) {
        callback({
          result: 'error',
          message: 'Zero sized output image detected.'
        }, null);
      }

      var results = {
        page: page,
        name: path.basename(output),
        size: fs.statSync(output)['size'] / 1000.0,
        path: output
      };

      callback(null, results);
    });
};

// Check if directory is exists
var isDirExists = function(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
}

// Check if file is exists
var isFileExists = function(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    return false;
  }
}


// Convert list of pdf files, 1st argument is array of pdf files, 2nd argument need to pass opts object to set options variable
Pdf2Img.prototype.convertList = function(arr, opts, callbackreturn) {
  async.eachSeries(arr, function(file, callback) {
    Pdf2Img.prototype.setOptions(opts);
    Pdf2Img.prototype.convert(file, function(err, info) {
      if(err) {
        return callback({
          error: 'Unable to convert file ' + file,
          message: err
        }, null);
      } else {
        callback(null, info);
      }
    });
  }, function(err) {
      if(err) {
        return callbackreturn({
          error: 'Unable to convert everything on array',
          message: err,
        }, null);
      } else {
        callbackreturn(null, 'All files have been converted');
      }
    });
};

module.exports = new Pdf2Img;
