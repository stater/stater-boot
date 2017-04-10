// Using sourcemap for error info.
require('source-map-support').install();

import assert from 'assert';

import { logger, Logger, entries, typeOf } from '../lib/helpers';
import { event } from '../lib/event';

import { configs } from './configs';
import { services } from './services';

import Loaders from './loader';

const { yellow } = logger.color;

const logs = new Logger({ signs: true });

export default class Stater {
  configs = configs;
  services = services;
  initialized = false;

  // Service event emitter.
  emit(event, callback) {
    assert(typeof event === 'string', 'Event name must be a string.');

    event.emit(event, callback);

    return this;
  }

  // Service event listener.
  listenEvent() {
    event.on('start', async (services, callback) => {
      assert(Array.isArray(services) || typeof services === 'string', 'Services to start must be an array or string.');

      let context = await this.start(services);

      if (typeof callback === 'function') {
        callback(context);
      }
    });

    event.on('start-service', async (services, callback) => {
      assert(Array.isArray(services) || typeof services === 'string', 'Services to start must be an array or string.');

      let concurrencies = await this.concurrent(services);

      if (typeof callback === 'function') {
        callback(concurrencies);
      }
    });
  }

  // Service bootstrapper.
  async bootstrap(name, service, configs, version) {
    assert(typeof name === 'string', 'Service name to bootstrap must be as tring.');
    assert(typeOf(service) === 'constructor', 'Service to bootstrap must be a constructor.');
    assert(Array.isArray(configs) || typeOf(configs) === 'object', 'Bootstrap must provide object config or array configs.');

    // Registering bootstrap service.
    logs.debug(`Registering bootstrap service ${yellow(`${name}#${version || '0.0.1'}`)}...`);
    Loaders.registerService(name, service, version);
    logs.debug(`Bootstrap ${yellow(`${name}#${version || '0.0.1'}`)} registered.`);

    // Registering global services.
    logs.debug('Registering global services...');
    Loaders.loadServices();
    logs.debug('Global services registered.');

    // Registering default configs.
    logs.debug('Registering default configs...');
    await this.defaults();
    logs.debug('Default configs registerd.');

    // Registering configs.
    logs.debug('Registering user\'s configs...');
    await this.configure(configs);
    logs.debug('User\'s configs registerd.');

    // Reconfiguring configs.
    logs.debug('Reconfiguring configs...');
    await this.reconfigure();
    logs.debug('Configs reconfigured.');

    // Initializing services.
    logs.debug('Initializing services...');
    await this.initialize();
    logs.debug('Services initialized.');

    logs.success(`Bootstrap complete.
    Stater Boot ready to start.
    ---------------------------------------`, true);
  }

  // Service initializer.
  async initialize() {
    await this.services.initialize(this);

    this.initialized = true;

    return this;
  }

  // Default service's configs handler.
  async defaults() {
    // Registering default configs.
    for (let [name, versions] of entries(services.versions)) {
      for (let [, service] of entries(versions)) {
        if (typeof service.configs === 'object') {
          this.configs.add(name, service.configs);
        }
      }
    }

    return this;
  }

  // Configs setup handler.
  async configure(configs) {
    if (Array.isArray(configs)) {
      for (let config of configs) {
        await this.configure(config);
      }
    } else if (typeOf(configs) === 'object') {
      let { name, version, } = configs;
      assert(typeof name === 'string', 'Config name to add must be a string.');
      Loaders.registerConfigs(name, configs, version);
    }

    if (this.initialized) {
      await this.reconfigure();
    }

    return this;
  }

  // Configs reconfigure handler.
  async reconfigure() {
    // Reconfiguring configs.
    await this.configs.reconfigure();

    // Applying new configs to services.
    for (let [name, versions] of entries(services.versions)) {
      for (let [, service] of entries(versions)) {
        if (typeof service.configs === 'object') {
          let config = this.configs.get(name);

          if (config) {
            service.configs = config;
          }
        }
      }
    }

    return this;
  }
}
