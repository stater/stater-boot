import assert from 'assert';

import get from './getter';

export default function del(target, path) {
  assert(typeof path === 'string', 'Target path must be a string.');

  let paths = path.split('.');
  let epath = path[path.length - 1];

  paths.pop();

  let tpath = paths.join('.');
  let todel = get(target, tpath);

  if (todel && todel[epath]) {
    if (Array.isArray(todel)) {
      todel.splice(epath, 1);
    } else {
      delete todel[epath];
    }
  }

  return target;
}
