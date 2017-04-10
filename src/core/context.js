import { Storage } from '../lib';
import { Logger } from '../lib/helpers';

const LoggerIndex = {};

export default class Context extends Storage {
  constructor(runner) {
    super();

    this.runner = runner;

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
    if (this.runner && this.runner.start) {
      try {
        return await this.runner.start(...args);
      } catch (error) {
        throw error;
      }
    } else {
      throw new Error(`Context ${this.id} not properly initialized.`);
    }
  }

  emit(...args) {
    this.runner.emit(...args);
    return this;
  }
}
