const { describe, it } = global;

import apply from './apply';
import assert from 'assert';

class Test {
  name = 'Test';

  constructor(name = 'T', ages = 1) {
    this.name = name;
    this.ages = ages;
  }
}

describe('[Apply Helper] => apply()', () => {
  it('Should trhow an error to call apply() without giving a class.', done => {
    try {
      apply();
    } catch (err) {
      done();
    }
  });

  it('Should create new instance of class using apply() method with default arguments.', () => {
    let x = apply(Test);

    assert.equal(x.name, 'T');
    assert.equal(x.ages, 1);
  });

  it('Should create new instance of class using apply() method.', () => {
    let x = apply(Test, 'Testing', 20);

    assert.equal(x.name, 'Testing');
    assert.equal(x.ages, 20);
  });
});
