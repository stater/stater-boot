import { the } from '../helpers/the';
import assert from 'assert';

export default function list(target, exclude) {
  assert(the(target).is(['array', 'object', 'arguments', 'function']), 'Target should be an array, an object, an arguments or a function.');

  let path = '';
  let maps = {};

  parse(path, maps, target, exclude);

  return maps;
}

function parse(path, maps, object, exclude) {
  for (let key in object) {
    const value = object[key];

    let last = path;
    let cpath = `${path}${(!path ? '' : '.')}${key}`;

    if (the(value).not(['array', 'object', 'arguments', 'function']) || !exclude) {
      maps[cpath] = value;
    }

    if (the(value).is(['array', 'object', 'arguments', 'function'])) {
      path = cpath;
      parse(path, maps, value, exclude);
      path = last;
    }
  }
}
