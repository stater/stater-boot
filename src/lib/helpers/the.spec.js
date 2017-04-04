const { describe, it } = global;

import { the, typeOf } from './the';
import assert from 'assert';

describe('[The Helper] => typeOf()', () => {
  it('Should return undefined to check undefined.', () => {
    assert.equal(typeOf(), 'undefined');
  });

  it('Should return "array" to check [].', () => {
    assert.equal(typeOf([]), 'array');
  });

  it('Should return "object" to check {}.', () => {
    assert.equal(typeOf({}), 'object');
  });
});

describe('[The Helper] => the()', () => {
  it('Should return true to check undefined as undefined.', () => {
    assert.ok(the().is('undefined'));
  });

  it('Should return true to check [] as array.', () => {
    assert.ok(the([]).is('array'));
  });

  it('Should return true to check {} as object.', () => {
    assert.ok(the({}).is('object'));
  });
});
