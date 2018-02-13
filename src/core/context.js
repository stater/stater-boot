import assert from 'assert';

import { Storage } from '../lib';
import { Logger, typeOf } from '../lib/helpers';

const LoggerIndex = {};

export default class Context extends Storage {
  get logs() {
    return LoggerIndex[this.id];
  }

  constructor(runner, parent) {
    super();

    this.runner = runner;
    this.parent = parent || null;

    LoggerIndex[this.id] = new Logger({
      caller: `${this.id}`,
      write: true,
      signs: true
    });
  }

  sign(name) {
    if (typeof name === 'string') {
      this.logs.config.caller = `${name}][${this.id}`;
    } else {
      this.logs.config.caller = `${this.id}`;
    }

    return this.logs;
  }

  emit(...args) {
    this.runner.emit(...args);
    return this;
  }

  create(data) {
    this.logs.debug('Creating child context...', 'info');

    let context = new Context(this.runner, this);

    if (typeOf(data) === 'object') {
      Object.assign(context.get(), data);
    }

    this.logs.debug(`Child context created with id ${context.id}`, 'success');

    return context;
  }

  async start(services, payload) {
    assert(Array.isArray(services) ||
      typeof services === 'string' ||
      typeof services === 'function', 'Services to start must be an array, string, or function.');

    this.logs.debug(`Starting child service${Array.isArray(services) ? 's' : ''}.`, 'info');

    if (this.runner && this.runner.start) {
      let context = this.create(payload || this.get());

      try {
        return await this.runner.start(services, context);
      } catch (error) {
        throw error;
      }
    } else {
      throw new Error(`Context ${this.id} corrupted.`);
    }
  }

  async spawn(services) {
    assert(Array.isArray(services) ||
      typeof services === 'string' ||
      typeof services === 'function', 'Services to spawn must be an array, string or function.');

    if (this.runner && this.runner.start) {
      try {
        return await this.runner.start(services, this);
      } catch (error) {
        throw error;
      }
    } else {
      throw new Error(`Context ${this.id} corrupted.`);
    }
  }
}
