'use strict';

var
  util = require('util'),
  Q = require('q'),
  gm = require('gm'),
  converter = require('./converter'),
  debug = require('debug')('pictor:converter:resize'),
  DEBUG = debug.enabled;

/**
 * resize image.
 *
 * `flags` are one of the followings:
 *    - '!': force. ignore aspect ratio.
 *    - '%': percent.
 *    - '^': fill area.
 *    - '<': enlarge.
 *    - '>': shrink.
 *    - '@': pixel.
 *
 * @param {string} src
 * @param {string} dst
 * @param {number} w
 * @param {number} h
 * @param {string} flags
 * @returns {promise} success or not
 */
function resize(src, dst, w, h, flags) {
  DEBUG && debug('resize', src, '-->', dst, w, h);
  var cmd = gm(src).noProfile().resize(w || '', h || '', flags);
  return Q.ninvoke(cmd, 'write', dst);
}

//
//
//

function ResizeConverter(config) {
  ResizeConverter.super_.apply(this, arguments);
  DEBUG && debug('create resize converter: ', config);
}
util.inherits(ResizeConverter, converter.Converter);

ResizeConverter.prototype.getParamNames = function () {
  return ['w', 'h', 'flags'];
};

ResizeConverter.prototype.getVariation = function (opts) {
  return 'resize_' + (opts.w || '') + 'x' + (opts.h || '') + '_' + (opts.flags || '');
};

/**
 * resize an image.
 *
 * `opts` contains:
 *    - {number} w
 *    - {number} h
 *    - {string} flags
 * @param {object} opts
 * @returns {promise}
 */
ResizeConverter.prototype.convert = function (opts) {
  return resize(opts.src, opts.dst, opts.w, opts.h, opts.flags);
};

module.exports = ResizeConverter;
