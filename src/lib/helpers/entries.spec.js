const { describe, it } = global;

import entries from './entries';
import assert from 'assert';

describe('[Helper] => entries()', () => {
  it('Should return array entries of { a: 1, b: 2 }.', () => {
    assert.equal(2, entries({ a: 1, b: 2 }).length);
  });

  it('Should return [a, 1] for first entry of { a: 1, b: 2 }.', () => {
    const [key, value] = entries({ a: 1, b: 2 })[0];

    assert.equal('a', key);
    assert.equal(1, value);
  });
});
