import typeOf from 'jsmicro-typeof';
import assert from 'assert';

import { the } from '../helpers/the';
import entries from '../helpers/entries';
import set from './setter';
import list from './list';

export default function merge(source, ...targets) {
  assert(the(source).is(['array', 'object', 'arguments', 'function']), 'The source should be an array, an object, an arguments or a function.');

  const spaths = list(source);

  for (let target of targets) {
    assert(the(target).like(source), 'The target and the source should have an equal type.');

    if (typeOf(target) === 'storage') {
      target = target.data;
    }

    let tpaths = list(target);

    for (let [path, value] of entries(tpaths)) {
      if (the(value).is(['array', 'object', 'arguments', 'function'])) {
        if (the(spaths[path]).unlike(value)) {
          set(source, path, value);
        }
      } else {
        set(source, path, value);
      }
    }
  }

  return source;
}
