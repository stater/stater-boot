const { describe, it } = global;

import list from './list';
import assert from 'assert';

describe('[Object Helper] => list()', () => {
  it('Should be failed when the target is not an object, array, arguments, or function.', done => {
    try {
      list('test');
    } catch (err) {
      done();
    }
  });

  it('Should list the properties and values of {a:1,b:{c: 3},c:[1,2]}', () => {
    let x = list({ a: 1, b: { c: 3 }, c: [1, 2] });

    assert.equal(3, x['b.c']);
  });

  it('Should list the properties and values by excluding iterable objects of {a:1,b:{c: 3},c:[1,2]}', () => {
    let x = list({ a: 1, b: { c: 3 }, c: [1, 2] }, true);

    assert.equal(undefined, x.c);
  });
});
