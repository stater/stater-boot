import assert from 'assert';

export default function apply(fn, ...params) {
  assert(typeof fn === 'function', 'Function to apply should be a function.');

  return new (Function.prototype.bind.apply(fn, [null, ...params]));
}
