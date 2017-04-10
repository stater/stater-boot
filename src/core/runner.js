import assert from 'assert';
import { parse } from '@stater/read-cli';

import { logger } from '../lib/helpers';
import { configs as cfgStore } from './configs';
import { services as svcStore } from './services';
import { event } from '../lib/event';

import Context from './context';

const { yellow, magenta } = logger.color;
const { arg: cliargv } = parse();

export default class Runner {
  // Service event emitter.
  static emit(name, callback) {
    assert(typeof name === 'string', 'Event name must be a string.');
    event.emit(name, callback);
    return this;
  }

  // Asynchronus paralel service(s) runner.
  static async concurrent(services, context) {
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
  static async start(services, context) {
    assert(Array.isArray(services) || typeof services === 'string', 'Service to start must be an array or string.');

    let asinits = false;

    if (!context) {
      asinits = true;
      context = new Context(this);
    }

    if (Array.isArray(services)) {
      if (asinits) {
        logger.as('start').debug(`Starting multiple services in context ${yellow(context.id)}...`);
      }

      for (let service of services) {
        assert(typeof service === 'string', 'Service to start must be a string.');
        await this.startService(service, context);
      }

      if (asinits) {
        logger.as('start').debug(`Multiple services in context ${yellow(context.id)} started.`);
      }
    } else if (typeof services === 'string') {
      await this.startService(services, context);
    }

    return context;
  }

  // Single asynchronus service runner.
  static async startService(svc_name, context) {
    assert(typeof svc_name === 'string', 'Service to start must be string service name.');
    assert(typeof context === 'object', 'Service to start requires context.');

    let service;

    try {
      service = svcStore.get(svc_name);
    } catch (error) {
      context.logs.error(error.message);
      context.logs.debug(error.stack);

      if (cliargv.erroff) {
        return context;
      } else {
        throw new Error(`Unknown service: ${svc_name}.`);
      }
    }

    let { name, version } = service;
    let signature = { name, version };

    context.logs.debug(`Starting service ${yellow(name)}#${magenta(version)}...`);

    if (Array.isArray(service.beforeRun)) {
      context.logs.debug(`Starting beforeRun services of ${yellow(name)}#${magenta(version)}...`);
      await this.start(service.beforeRun, context);
      context.logs.debug(`Finished beforeRun services of ${yellow(name)}#${magenta(version)}.`);
    }

    if (typeof service.service === 'function') {
      context.logs.debug(`Running service ${yellow(name)}#${magenta(version)}...`);
      await this.execService({ service: service.service, owner: service }, context, signature);
      context.logs.debug(`Finished running service ${yellow(name)}#${magenta(version)}.`);
    }

    if (Array.isArray(service.services)) {
      context.logs.debug(`Starting services of ${yellow(name)}#${magenta(version)}...`);
      await this.start(service.services, context);
      context.logs.debug(`Finished services of ${yellow(name)}#${magenta(version)}.`);
    }

    if (Array.isArray(service.beforeEnd)) {
      context.logs.debug(`Starting beforeEnd services of ${yellow(name)}#${magenta(version)}...`);
      await this.start(service.beforeEnd, context);
      context.logs.debug(`Finished beforeEnd services of ${yellow(name)}#${magenta(version)}.`);
    }

    context.logs.debug(`Services ${yellow(name)}#${magenta(version)} done.`);

    return context;
  }

  // Service execution handler.
  static execService({ service, owner }, context, signature) {
    assert(typeof service === 'function', 'Service to execute must be a function.');
    assert(typeof context === 'object' && context.id, 'Service context must be a context.');
    assert(typeof signature === 'object' && signature.name && signature.version, 'Service signature must be an object.');

    let { name, version } = signature;

    context.sign(`${yellow(name)}#${magenta(version)}`);

    return new Promise((resolve, reject) => {
      try {
        let res = service.call(owner, context, cfgStore);

        if (res && typeof res.then === 'function') {
          res
            .then(() => {
              this.execDone(context, resolve);
            })
            .catch(error => {
              this.execFail(context, error, resolve, reject);
            });
        } else {
          this.execDone(context, resolve);
        }
      } catch (error) {
        this.execFail(context, error, resolve, reject);
      }
    });
  }

  // Service execution complete handler.
  static execDone(context, resolve) {
    context.sign();
    resolve(context);
  }

  // Service execution error handler.
  static execFail(context, error, resolve, reject) {
    context.logs.error('Service execution failed.');
    context.logs.error(error.message);
    context.sign();

    if (!cliargv.erroff) {
      reject(error);
    } else {
      context.logs.debug(error.stack);
      resolve(context);
    }
  }
}
