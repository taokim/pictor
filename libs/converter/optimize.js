'use strict';

var
  util = require('util'),
  path = require('path'),
  _ = require('lodash'),
  Q = require('q'),
  gm = require('gm'),
  converter = require('./converter'),
  debug = require('debug')('pictor:converter:optimize'),
  DEBUG = debug.enabled;

function optimizeJpg(src, dst) {
  var execFile = require('child_process').execFile;
  var jpegtranPath = require('jpegtran-bin').path;
  return Q.nfcall(execFile, jpegtranPath, ['-copy', 'none', '-optimize', '-outfile', dst, src]);
}

function optimizePng(src, dst) {
  var execFile = require('child_process').execFile;
  var optipngPath = require('optipng-bin').path;
  return Q.nfcall(execFile, optipngPath, ['-quiet', '-force', '-strip', 'all', '-out', dst, src]);
}

function optimizeGif(src, dst) {
  var execFile = require('child_process').execFile;
  var gifsiclePath = require('gifsicle').path;
  return Q.nfcall(execFile, gifsiclePath, ['--careful', '-w', '-o', dst, src]);
}

/**
 * optimize the given image.
 *
 * @param {string} src
 * @param {string} dst
 * @returns {promise} success or not
 */
function optimize(src, dst) {
  var cmd = gm(src);
  return Q.ninvoke(cmd, 'format')
    .then(function (format) {
      switch (format) {
        case 'JPEG':
          return optimizeJpg(src, dst);
        case 'PNG':
          return optimizePng(src, dst);
        case 'GIF':
          return optimizeGif(src, dst);
      }
      // unsupported format!?
      // simply convert it without profile data!
      //return convert(src, dst);
      throw new Error('unsupported format');
    });
}

//
//
//

function OptimizeConverter(config) {
  OptimizeConverter.super_.apply(this, arguments);
  DEBUG && debug('create optimize converter: ', config);
}
util.inherits(OptimizeConverter, converter.Converter);

OptimizeConverter.prototype.getParamNames = function () {
  return [];
};

OptimizeConverter.prototype.getVariation = function (opts) {
  return 'optimize';
};

OptimizeConverter.prototype.getExtension = function (opts) {
  // always same to src format!
  return path.extname(opts.src).substring(1);
};

OptimizeConverter.prototype.convert = function (opts) {
  return optimize(opts.src, opts.dst);
};

module.exports = OptimizeConverter;
