const { describe, it } = global;

import { split, match, latest } from './version';
import assert from 'assert';

const versions = ['1.0.0', '1.9.0', '1.9.1', '1.9.2', '1.9.3', '2.0.0', '3.0.0'];

describe('[Version Helper] => split()', () => {
  it('Should throw an error if the vstring is not a string.', done => {
    try {
      split(100);
    } catch (err) {
      done();
    }
  });

  it('Should split name, version and path from "Test#1.0.0:host".', () => {
    let { name, version, path } = split('Test#1.0.0:host');

    assert.equal(name, 'Test');
    assert.equal(version, '1.0.0');
    assert.equal(path, 'host');
  });

  it('Should split the name and version from "Test#1.0.0" with path = null.', () => {
    let { name, version, path } = split('Test#1.0.0');

    assert.equal(name, 'Test');
    assert.equal(version, '1.0.0');
    assert.equal(path, null);
  });

  it('Should split the name and path from "Test:host" with version = null.', () => {
    let { name, version, path } = split('Test:host');

    assert.equal(name, 'Test');
    assert.equal(version, null);
    assert.equal(path, 'host');
  });
});

describe('[Version Helper] => match()', () => {
  it('Should throw an error if the sources is not an array.', done => {
    try {
      match({});
    } catch (err) {
      done();
    }
  });

  it('Should throw an error if the target is not a string.', done => {
    try {
      match([], 100);
    } catch (err) {
      done();
    }
  });

  it('Should match the correct version "1.9.3" with "~1.9.0', () => {
    let version = match(versions, '~1.9.0');

    assert.equal(version, '1.9.3');
  });

  it('Should match the correct version "3.0.0" with ">1.0.0', () => {
    let version = match(versions, '>1.0.0');

    assert.equal(version, '3.0.0');
  });
});

describe('[Version Helper] => latest()', () => {
  it('Should throw an error if the sources is not an array.', done => {
    try {
      latest(100);
    } catch (err) {
      done();
    }
  });

  it('Should got the latest version "3.0.0".', () => {
    let version = latest(versions);

    assert.equal(version, '3.0.0');
  });
});
