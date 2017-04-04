const { describe, it } = global;

import merge from './merge';
import assert from 'assert';

describe('[Object Helper] => merge()', () => {
  it('Should be failed when the target is not an object, array, arguments, or function.', done => {
    try {
      merge('test');
    } catch (err) {
      done();
    }
  });

  it('Should be failed to merge different object type.', done => {
    try {
      merge({}, []);
    } catch (err) {
      done();
    }
  });

  it('Should merge two objects.', () => {
    let x = { a: { a: 1, b: 2 }, b: 2 };
    let y = { a: { c: 3 }, c: 3, d: 4 };

    merge(x, y);

    assert.equal(4, x.d);
  });

  it('Should merge two objects without overwriting.', () => {
    let x = { a: { a: 1, b: 2 }, b: 2 };
    let y = { a: { c: 3 }, c: 3, d: 4 };

    merge(x, y);

    assert.equal(1, x.a.a);
  });
});
