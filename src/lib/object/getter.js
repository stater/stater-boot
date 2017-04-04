import { the } from '../helpers/the';
import assert from 'assert';

export default function get(target, path, vdef) {
  assert(the(target).is(['array', 'object', 'arguments', 'function']), 'Target should be an object, an array, an arguments or a function.');
  assert((typeof path === 'string' || Array.isArray(path)), 'Path should be a string or an array.');

  if (typeof path === 'string') {
    let current = target;
    let paths = path.split('.');
    let done, result;

    while (!done && paths.length > 0) {
      let [next] = paths;

      if (paths.length <= 1) {
        if (typeof current[next] !== 'undefined') {
          result = current[next];
        } else {
          result = undefined;
          done = true;
        }
      } else {
        if (the(current[next]).is(['object', 'array', 'arguments', 'function'])) {
          current = current[next];
        } else {
          result = undefined;
          done = true;
        }
      }

      paths.shift();
    }

    if (typeof result === 'undefined' && typeof vdef !== 'undefined') {
      result = vdef;
    }

    return result;
  }
}
