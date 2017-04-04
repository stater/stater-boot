const { describe, it } = global;

import { absolute } from './path';
import assert from 'assert';
import { platform } from 'os';

describe('[Path Helper] => absolute()', () => {
  it('Should be failed when the path is not a string.', done => {
    try {
      absolute(10);
    } catch (err) {
      done();
    }
  });

  it('Should do nothing when the path is absolute.', () => {
    let x = '/Domains/www.stater.io';

    assert.equal(x, absolute(x));
  });

  it('Should absolute to the cwd.', () => {
    let x = `${process.cwd()}${platform() === 'win32' ? '\\' : '/'}lib`;

    assert.equal(x, absolute('lib'));
  });
});
