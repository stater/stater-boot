const { describe, it } = global;

import get from './getter';
import assert from 'assert';

describe('[Object Helper] => get()', () => {
  it('Should be failed when the target is not an object, array, arguments, or function.', done => {
    try {
      get('test', 'a');
    } catch (err) {
      done();
    }
  });

  it('Should return 10 to get "a" from {a:10}.', () => {
    assert.equal(10, get({ a: 10 }, 'a'));
  });

  it('Should return "test" to get "type" from [Function]', () => {
    function x() {}

    x.type = 'test';

    assert.equal('test', x.type);
  });

  it('Should return 10 to get "a.b.c.d" from {a:{b:{c:{d:10}}}}', () => {
    assert.equal(10, get({ a: { b: { c: { d: 10 } } } }, 'a.b.c.d'));
  });
});
