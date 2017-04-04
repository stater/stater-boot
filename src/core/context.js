import { Storage } from '../lib';
import { Logger } from '../lib/helpers';

const LoggerIndex = {};
let stater = null;

export default class Context extends Storage {
  constructor(s) {
    super();

    stater = s;

    LoggerIndex[this.id] = new Logger({
      caller: `${this.id}`,
      write: true,
      signs: true
    });
  }

  get logs() {
    return LoggerIndex[this.id];
  }

  sign(name) {
    if (typeof name === 'string') {
      this.logs.config.caller = `${name}][${this.id}`;
    } else {
      this.logs.config.caller = `${this.id}`;
    }

    return this.logs;
  }

  async start(...args) {
    if (stater && stater.start) {
      try {
        return await stater.start(...args);
      } catch (error) {
        throw error;
      }
    } else {
      throw new Error(`Context ${this.id} not properly initialized.`);
    }
  }

  emit(...args) {
    stater.emit(...args);
    return this;
  }
}
