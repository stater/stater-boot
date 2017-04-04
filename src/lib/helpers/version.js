import assert from 'assert';
import { gt, maxSatisfying } from 'semver';

/**
 * Split version string into mapped version.
 *
 * @param vstring
 * @returns {*}
 */
export function split(vstring) {
  assert(typeof vstring === 'string', 'Version string should be a string!');

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
export function match(sources, target) {
  assert(Array.isArray(sources), 'Version sources should be an array.');
  assert(typeof target === 'string', 'Version target should be a string.');

  return maxSatisfying(sources, target);
}

/**
 * Get the latest version of versions list.
 *
 * @param sources
 * @returns {*}
 */
export function latest(sources) {
  assert(Array.isArray(sources), 'Version sources should be an array.');

  let version;

  for (let ver of sources) {
    if (!version || gt(ver, version)) {
      version = ver;
    }
  }

  return version;
}
