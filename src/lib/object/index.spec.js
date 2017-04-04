const { describe, it } = global;

import * as object from './index';
import assert from 'assert';

describe('[Object Helper] => {object}', () => {
  it('Should contains all the object helpers.', ()=> {
    assert.ok(object.set && object.get && object.bind && object.merge && object.list);
  });
});
