const { describe, it } = global;

import typeOf from './typeof';
import assert from 'assert';

describe('[TypeCheck Helper] => typeOf()', () => {
  it('Should return "undefined" to check undefined.', () => {
    assert.equal(typeOf(), 'undefined');
  });

  it('Should return "null" to check null.', () => {
    assert.equal(typeOf(null), 'null');
  });

  it('Should return "boolean" to check true.', () => {
    assert.equal(typeOf(true), 'boolean');
  });

  it('Should return "boolean" to check false.', () => {
    assert.equal(typeOf(false), 'boolean');
  });

  it('Should return "string" to check "".', () => {
    assert.equal(typeOf(''), 'string');
  });

  it('Should return "string" to check "true".', () => {
    assert.equal(typeOf('true'), 'string');
  });

  it('Should return "string" to check "false".', () => {
    assert.equal(typeOf('false'), 'string');
  });

  it('Should return "string" to check "0.1".', () => {
    assert.equal(typeOf('0.1'), 'string');
  });

  it('Should return "number" to check 10.', () => {
    assert.equal(typeOf(10), 'number');
  });

  it('Should return "number" to check NaN.', () => {
    assert.equal(typeOf(NaN), 'number');
  });

  it('Should return "number" to check 0.1.', () => {
    assert.equal(typeOf(0.1), 'number');
  });

  it('Should return "function" to check () => {}.', () => {
    assert.equal(typeOf(() => {}), 'function');
  });

  it('Should return "constructor" to check function x() {}.', () => {
    assert.equal(typeOf(function x() {}), 'constructor');
  });

  it('Should return "constructor" to check x = function() {}.', () => {
    let x = function () {};
    assert.equal(typeOf(x), 'constructor');
  });

  it('Should return "constructor" to check class X {}.', () => {
    class X {}

    assert.equal(typeOf(X), 'constructor');
  });

  it('Should return "object" to check {}.', () => {
    assert.equal(typeOf({}), 'object');
  });

  it('Should return "array" to check [].', () => {
    assert.equal(typeOf([]), 'array');
  });

  it('Should return "arguments" to check arguments.', function () {
    assert.equal(typeOf(arguments), 'arguments');
  });

  it('Should return "date" to check new Date().', () => {
    assert.equal(typeOf(new Date()), 'date');
  });
});
