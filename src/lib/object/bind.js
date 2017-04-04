import { the } from '../helpers/the';
import assert from 'assert';

export default function bind(target, name, value) {
  assert(the(target).is(['object', 'function']), 'Target should be an object or a function.');
  assert(typeof name === 'string', 'Property name should a string.');

  target[name] = value;

  Object.defineProperty(target, name, { enumerable: false, writable: false });

  return target;
}
