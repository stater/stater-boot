const { describe, it } = global;

import * as helpers from './index';
import assert from 'assert';

describe('[Helper Index] => {object}', () => {
  it('Should contains all the helpers.', ()=> {
    assert.equal(Object.keys(helpers).length, 12);
  });
});
