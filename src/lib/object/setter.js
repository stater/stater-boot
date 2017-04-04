import { the } from '../helpers/the';
import assert from 'assert';

export default function set(target, path, value) {
  assert(the(target).is(['array', 'object', 'arguments', 'function']), 'Target should be an array, an object, an arguments or a function.');
  assert(typeof path === 'string', 'Target path should be a string.');

  let current = target;
  let paths = path.split('.');

  while (paths.length > 0) {
    const [next] = paths;

    if (paths.length <= 1) {
      current[next] = value;
      current = current[next];
    } else {
      if (the(current[next]).is(['array', 'object', 'arguments', 'function'])) {
        current = current[next];
      } else {
        current[next] = {};
        current = current[next];
      }
    }

    paths.shift();
  }

  return current;
}
