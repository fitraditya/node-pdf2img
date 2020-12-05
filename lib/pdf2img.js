"use strict";

var fs = require('fs');
var gm = require('gm');
var path = require('path');
var async = require('async');


class Pdf2Img {

    options = {
        type: 'jpg',
        size: 1024,
        density: 600,
        outputdir: null,
        outputname: null,
        page: null,
        quality: 100
    };

    constructor(options) {
        this.options = options
    }

    convert(input, callbackreturn) {
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
            function (callback) {
                gm(input).identify("%p ", function (err, value) {
                    var pageCount = String(value).split(' ');

                    if (!pageCount.length) {
                        callback({
                            result: 'error',
                            message: 'Invalid page number.'
                        }, null);
                    } else {
                        // Convert selected page
                        if (options.page !== null) {
                            if (options.page <= pageCount.length) {
                                callback(null, [options.page]);
                            } else {
                                callback({
                                    result: 'error',
                                    message: 'Invalid page number.'
                                }, null);
                            }
                        } else {
                            callback(null, pageCount);
                        }
                    }

                })

            },


            // Convert pdf file
            function (pages, callback) {
                // Use eachSeries to make sure that conversion has done page by page
                async.eachSeries(pages, function (page, callbackmap) {
                    var inputStream = fs.createReadStream(input);
                    var outputFile = options.outputdir + options.outputname + '_' + page + '.' + options.type;

                    convertPdf2Img(inputStream, outputFile, parseInt(page), function (error, result) {
                        if (error) {
                            return callbackmap(error);
                        }

                        stdout.push(result);
                        return callbackmap(error, result);
                    });
                }, function (e) {
                    if (e) callback(e);

                    return callback(null, {
                        result: 'success',
                        message: stdout
                    });
                });
            }
        ], callbackreturn);
    };

    convertPdf2Img(input, output, page, callback) {
        if (input.path) {
            var filepath = input.path;
        } else {
            return callback({
                result: 'error',
                message: 'Invalid input file path.'
            }, null);
        }

        var filename = filepath + '[' + (page - 1) + ']';
        gm(input, filename)
            .density(options.density, options.density)
            .resize(options.size)
            .quality(options.quality)
            .write(output, function (err) {
                if (err) {
                    return callback({
                        result: 'error',
                        message: 'Can not write output file.'
                    }, null);
                }

                if (!(fs.statSync(output)['size'] / 1000)) {
                    return callback({
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

                return callback(null, results);
            });
    };

// Check if directory is exists

    isDirExists(path) {
        try {
            return fs.statSync(path).isDirectory();
        } catch (e) {
            return false;
        }
    }

// Check if file is exists

    isFileExists(path) {
        try {
            return fs.statSync(path).isFile();
        } catch (e) {
            return false;
        }
    }


}

module.exports = Pdf2Img;
