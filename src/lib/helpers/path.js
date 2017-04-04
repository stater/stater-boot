import { join } from 'path';
import assert from 'assert';

export function absolute(path, cwd) {
  assert(typeof path === 'string', 'Path must be a string.');

  if (/^\//.test(path) || /^[\w]:/.test(path)) {
    return path;
  } else {
    return join(cwd || process.cwd(), path);
  }
}
