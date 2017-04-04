import assert from 'assert';

import { typeOf, logger, suid } from './helpers';
import { get, set, merge, list, bind } from './object';
import { event } from './event';

const { magenta } = logger.color;

// Storage Index Holder.
class StorageLibrary {}
const slib = new StorageLibrary();

// Storage Remover Event Handler.
event.on('storage-index.delete', (id) => {
  assert(typeof id === 'string', 'ERDELSR: Storage ID must be a string.');
  delete slib[id];
});

// Storage Class.
export default class Storage {
  constructor(data = {}) {
    assert(typeOf(data) === 'object', `${magenta('data')} should be an object!`);

    let uuid = suid();

    Object.defineProperty(this, 'id', { enumerable: false, writable: false, value: uuid });

    // Create data holder.
    slib[uuid] = createClass(`${this.constructor.name}Data`);

    // Assign the given data to the data holder.
    Object.assign(slib[uuid], data);
  }

  get(path, reversed) {
    if (typeof path !== 'undefined') {
      assert(typeof path === 'string', `${magenta('path')} should be a string!`);
      return get(slib[this.id] || {}, path, reversed);
    } else {
      return slib[this.id] || {};
    }
  }

  set(path, value) {
    assert(typeof path === 'string', `${magenta('path')} should be a string!`);
    set(slib[this.id] || {}, path, value);
    return this;
  }

  con(path, value) {
    assert(typeof path === 'string', `${magenta('path')} should be a string!`);
    bind(slib[this.id] || {}, path, value);
    return this;
  }

  merge(...targets) {
    assert(targets.length > 0, `${magenta('targets')} cannot be blank and must be in equal types.`);
    merge(slib[this.id] || {}, ...targets);
    return this;
  }

  list(exclude = true) {
    return list(slib[this.id] || {}, exclude);
  }
}

function createClass(name) {
  return new (new Function(`return class ${name} {}`)())();
}
