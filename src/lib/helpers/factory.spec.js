const { describe, it } = global;

import factory from './factory';
import assert from 'assert';

describe('[Factory Helper] => factory()', () => {
  it('Should failed when the given argument is not a function.', done => {
    try {
      factory([]);
    } catch (err) {
      done();
    }
  });

  it('Should parse the required factories (bob, john) as ["bob", "john"]', () => {
    let x = factory((bob, john) => {});

    assert.equal(x.args.join(','), 'bob,john');
  });

  it('Should parse the required factories (bob, john) as ["bob", "john"] from a class', () => {
    class F {
      constructor(bob, john) {}
    }

    let x = factory(F);

    assert.equal(x.args.join(','), 'bob,john');
  });

  it('Should parse the required factories (bob, john) as ["bob", "john"] using direct', () => {
    let f = (x, y) => {}
    f.$require = ['bob', 'john'];

    let x = factory(f);

    assert.equal(x.args.join(','), 'bob,john');
  });

  it('Should give the values for the required factories (bob, john) to be ["BOB", "JOHN"]', () => {
    let x = factory((bob, john) => {});
    let y = { bob: 'BOB', john: 'JOHN' };

    assert.deepEqual(x.parse(y), ['BOB', 'JOHN']);
  });

  it('Should give the values for the required factories (bob, john) to be ["BOB", "JOHN"] using direct', () => {
    let f = (x, y) => {};
    f.$require = ['bob', 'john'];

    let x = factory(f);
    let y = { bob: 'BOB', john: 'JOHN' };

    assert.deepEqual(x.parse(y), ['BOB', 'JOHN']);
  });
});
