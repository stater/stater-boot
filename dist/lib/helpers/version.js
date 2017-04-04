'use strict';

exports.__esModule = true;
exports.split = split;
exports.match = match;
exports.latest = latest;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _semver = require('semver');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Split version string into mapped version.
 *
 * @param vstring
 * @returns {*}
 */
function split(vstring) {
  (0, _assert2.default)(typeof vstring === 'string', 'Version string should be a string!');

  if (vstring.includes('#')) {
    let [name, version, path] = vstring.split(/[#:]/);

    if (path) {
      path = path.split('/').join('.');
    }

    return { name, version, path };
  } else {
    let [name, path] = vstring.split(':');

    if (path) {
      path = path.split('/').join('.');
    }

    return { name, version: null, path };
  }
}

/**
 * Match version from versions list.
 *
 * @param sources
 * @param target
 * @returns {*}
 */
function match(sources, target) {
  (0, _assert2.default)(Array.isArray(sources), 'Version sources should be an array.');
  (0, _assert2.default)(typeof target === 'string', 'Version target should be a string.');

  return (0, _semver.maxSatisfying)(sources, target);
}

/**
 * Get the latest version of versions list.
 *
 * @param sources
 * @returns {*}
 */
function latest(sources) {
  (0, _assert2.default)(Array.isArray(sources), 'Version sources should be an array.');

  let version;

  for (let ver of sources) {
    if (!version || (0, _semver.gt)(ver, version)) {
      version = ver;
    }
  }

  return version;
}