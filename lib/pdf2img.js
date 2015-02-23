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

module.exports = new Pdf2Img;