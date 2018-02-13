const { describe, it } = global;

import del from './delete';
import assert from 'assert';

let target = {
  a: {
    b: {
      c: 10,
      d: 5,
      e: [1, 2, 3]
    }
  }
}

describe('[Object Helper] => del()', () => {
  it('Should be failed when the target is not an object, array, arguments, or function.', done => {
    try {
      del('test', 'a');
    } catch (err) {
      done();
    }
  });

  it('Should delete "a.b.c" from { a: { b: { c: 10, d: 5, e: [1,2,3] } } }', () => {
    del(target, 'a.b.c');

    assert.ok(!target.a.b.hasOwnProperty('c'));
  });

  it('Should delete "a.b.e.1" from { a: { b: { c: 10, d: 5, e: [1,2,3] } } }', () => {
    del(target, 'a.b.e.1');

    assert.ok(target.a.b.e.length === 2 && target.a.b.e[1] === 3);
  });
});
