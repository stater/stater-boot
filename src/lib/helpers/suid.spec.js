const { describe, it } = global;

import suid from './suid';
import assert from 'assert';

describe('[Helper SUID] => suid()', () => {
  it('Should create short uniqie ID hash.', () => {
    let dt = new Date().toString();

    assert.equal(suid(dt), suid(dt));
  });

  it('Should create 100 different short unique ID hash.', () => {
    let list = {};
    let fine = true;

    for (let i = 0; i < 100; ++i) {
      let id = suid();

      if (!list[id]) {
        list[id] = id;
      } else {
        fine = false;
      }
    }

    assert.ok(fine);
  });
});
