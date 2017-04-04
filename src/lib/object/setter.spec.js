const { describe, it } = global;

import set from './setter';
import assert from 'assert';

describe('[Object Helper] => set()', () => {
  it('Should be failed when the target is not an object, array, arguments, or function.', done => {
    try {
      set('test', 'a');
    } catch (err) {
      done();
    }
  });

  it('Should return 10 to get "a" from {a:10}.', () => {
    assert.equal(10, set({}, 'a', 10));
  });

  it('Should return "test" to get "type" from [Function]', () => {
    function x() {}

    set(x, 'type', 'test');

    assert.equal('test', x.type);
  });

  it('Should set recursive path b.c.d.e:10 to { a:{} }.', () => {
    let x = { a: {} };

    set(x, 'b.c.d.e', 10);

    assert.equal(10, x.b.c.d.e);
  });
});
