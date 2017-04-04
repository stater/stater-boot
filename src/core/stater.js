import assert from 'assert';

import { logger, entries, typeOf } from '../lib/helpers';
import { event } from '../lib/event';

import { configs } from './configs';
import { services } from './services';

import Loaders from './loader';
import Context from './context';

const { yellow, magenta } = logger.color;

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
    logger.debug(`Registering bootstrap service ${yellow(`${name}#${version || '0.0.1'}`)}...`);
    Loaders.registerService(name, service, version);
    logger.debug(`Bootstrap ${yellow(`${name}#${version || '0.0.1'}`)} registered.`);

    // Registering global services.
    logger.debug('Registering global services...');
    Loaders.loadServices();
    logger.debug('Global services registered.');

    // Registering default configs.
    logger.debug('Registering default configs...');
    await this.defaults();
    logger.debug('Default configs registerd.');

    // Registering configs.
    logger.debug('Registering user\'s configs...');
    await this.configure(configs);
    logger.debug('User\'s configs registerd.');

    // Reconfiguring configs.
    logger.debug('Reconfiguring configs...');
    await this.reconfigure();
    logger.debug('Configs reconfigured.');

    // Initializing services.
    logger.debug('Initializing services...');
    await this.initialize();
    logger.debug('Services initialized.');

    logger.info('Stater bootstraped.');
  }

  // Service initializer.
  async initialize() {
    await this.services.initialize(this);

    this.initialized = true;
    logger.info('Stater initialized.');

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

  // Asynchronus paralel service(s) runner.
  async concurrent(services, context) {
    assert(Array.isArray(services) || typeof services === 'string', 'Service to run in background must be an array or string.');

    if (!context) {
      context = new Context(this);
    }

    if (Array.isArray(services)) {
      return services.map(service => {
        return new Promise((resolve, reject) => {
          this.start(service, context).then(resolve).catch(reject);
        });
      });
    } else {
      return this.start(services, context);
    }
  }

  // Asynchronus service(s) runner.
  async start(services, context) {
    assert(Array.isArray(services) || typeof services === 'string', 'Service to start must be an array or string.');

    if (!context) {
      context = new Context(this);
    }

    if (Array.isArray(services)) {
      for (let service of services) {
        assert(typeof service === 'string', 'Services in array must be a string service name(#version).');

        try {
          await this.start(service, context);
        } catch (error) {
          throw error;
        }
      }
    } else if (typeof services === 'string') {
      let service = this.services.get(services);
      let { name, version } = service;
      let signature = { name, version };

      context.logs.debug(`Starting service ${yellow(name)}#${magenta(version)}...`);

      if (Array.isArray(service.beforeRun)) {
        context.logs.debug(`Starting beforeRun services of ${yellow(name)}#${magenta(version)}...`);

        for (let child of service.beforeRun) {
          if (typeof child === 'string') {
            try {
              await this.start(child, context);
            } catch (error) {
              throw error;
            }
          } else {
            try {
              await this.exec({ service: child, owner: service }, context, signature);
            } catch (error) {
              throw error;
            }
          }
        }

        context.logs.debug(`Finished beforeRun services of ${yellow(name)}#${magenta(version)}.`);
      }

      if (typeof service.service === 'function') {
        context.logs.debug(`Running service ${yellow(name)}#${magenta(version)}...`);
        try {
          await this.exec({ service: service.service, owner: service }, context, signature);
        } catch (error) {
          throw error;
        }
        context.logs.debug(`Finished running service ${yellow(name)}#${magenta(version)}.`);
      }

      if (Array.isArray(service.services)) {
        context.logs.debug(`Starting services of ${yellow(name)}#${magenta(version)}...`);

        for (let child of service.services) {
          if (typeof child === 'string') {
            try {
              await this.start(child, context);
            } catch (error) {
              throw error;
            }
          } else if (typeof child === 'function') {
            try {
              await this.exec({ service: child, owner: service }, context, signature);
            } catch (error) {
              throw error;
            }
          } else {
            throw new Error(`Service ${yellow(name)}#${magenta(version)} contains invalid services.`);
          }
        }

        context.logs.debug(`Finished services of ${yellow(name)}#${magenta(version)}.`);
      }

      if (Array.isArray(service.beforeEnd)) {
        context.logs.debug(`Starting beforeEnd services of ${yellow(name)}#${magenta(version)}...`);

        for (let child of service.beforeEnd) {
          if (typeof child === 'string') {
            try {
              await this.start(child, context);
            } catch (error) {
              throw error;
            }
          } else {
            try {
              await this.exec({ service: child, owner: service }, context, signature);
            } catch (error) {
              throw error;
            }
          }
        }

        context.logs.debug(`Finished beforeEnd services of ${yellow(name)}#${magenta(version)}.`);
      }

      context.logs.debug(`Services ${yellow(name)}#${magenta(version)} done.`);
    }

    return context;
  }

  // Service execution handler.
  async exec({ service, owner }, context, signature) {
    assert(typeof service === 'function', 'Service to execute must be a function.');
    assert(typeof context === 'object' && context.id, 'Service context must be a context.');
    assert(typeof signature === 'object' && signature.name && signature.version, 'Service signature must be an object.');

    let { name, version } = signature;

    context.sign(`${yellow(name)}#${magenta(version)}`);
    try {
      await service.call(owner, context, this.configs);
    } catch (err) {
      try {
        await service(context, this.configs);
      } catch (error) {
        context.logs.error('Service execution failed.');
        throw error;
      }
    }
    context.sign();

    return context;
  }
}
