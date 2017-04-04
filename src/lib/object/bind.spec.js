const { describe, it } = global;

import bind from './bind';
import assert from 'assert';

describe('[Object Helper] => bind()', () => {
  it('Should be failed when the target type is not an object or a function.', done => {
    try {
      bind('', 'a', 10);
    } catch (err) {
      done();
    }
  });

  it('Should set a:10 to {}.', () => {
    let x = {};
    bind(x, 'a', 10);

    assert.equal(10, x.a);
  });

  it('Should hide property assigned by bind().', ()=> {
    let x = {};
    bind(x, 'a', 10);

    assert.equal(0, Object.keys(x).length);
  });
});
