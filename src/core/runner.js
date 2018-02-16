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
  static emit(name, ...args) {
    assert(typeof name === 'string', 'Event name must be a string.');
    event.emit(name, ...args);
    return this;
  }

  // Asynchronus paralel service(s) runner.
  static async concurrent(services, context) {
    assert(Array.isArray(services) ||
      typeof services === 'string' ||
      typeof services === 'function', 'Service to run in background must be an array, string, or function.');

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
    assert(Array.isArray(services) ||
      typeof services === 'string' ||
      typeof services === 'function', 'Service to start must be an array, string, or function.');

    if (!context) {
      context = new Context(this);
    }

    logger.debug(`Starting ${Array.isArray(services) ? 'multiple services' : 'service'} in context ${yellow(context.id)}...`, 'info');

    if (Array.isArray(services)) {
      for (let service of services) {
        assert(typeof service === 'string' ||
          typeof service === 'function', 'Service to start must be a string or function.');

        if (typeof service === 'string') {
          await this.startService(service, context);
        } else {
          await this.execService({ service, owner: service }, context, {
            name: service.name,
            version: '?'
          });
        }
      }
    } else if (typeof services === 'string') {
      await this.startService(services, context);
    } else if (typeof services === 'function') {
      await this.execService({ service: services, owner: services }, context, {
        name: services.name,
        version: '?'
      });
    }

    logger.debug(`${Array.isArray(services) ? 'Multiple services' : 'Service'}  in context ${yellow(context.id)} started.`, 'success');

    return context;
  }

  // Single asynchronus service runner.
  static async startService(svc_name, context) {
    assert(typeof svc_name === 'string', 'Service to start must be string service name.');
    assert(typeof context === 'object', 'Service to start requires context.');

    let service;

    try {
      service = svcStore.get(svc_name);

      if (typeof service === 'function') {
        service = { service, owner: service.owner, name: svc_name, version: '?' };
      }
    } catch (error) {
      context.logs.error(error.message || '', error);

      if (cliargv.erroff) {
        context.logs.debug(error.stack, 'error');
        return context;
      } else {
        throw new Error(`Unknown service: ${svc_name}.`);
      }
    }

    let { name, version } = service;
    let signature = { name, version };
    let name_str = `${yellow(name)}#${magenta(version)}`;

    context.logs.debug(`Starting service ${name_str}...`, 'info');

    if (Array.isArray(service.beforeRun)) {
      context.logs.debug(`Starting beforeRun services of ${name_str}...`, 'info');
      await this.start(service.beforeRun, context);
      context.logs.debug(`Finished beforeRun services of ${name_str}.`, 'success');
    }

    if (typeof service.service === 'function') {
      context.logs.debug(`Running service ${name_str}...`, 'info');
      await this.execService({ service: service.service, owner: (service.owner || service) }, context, signature);
      context.logs.debug(`Finished running service ${name_str}.`, 'success');
    }

    if (Array.isArray(service.services)) {
      context.logs.debug(`Starting services of ${name_str}...`, 'info');
      await this.start(service.services, context);
      context.logs.debug(`Finished services of ${name_str}.`, 'success');
    }

    if (Array.isArray(service.beforeEnd)) {
      context.logs.debug(`Starting beforeEnd services of ${name_str}...`, 'info');
      await this.start(service.beforeEnd, context);
      context.logs.debug(`Finished beforeEnd services of ${name_str}.`, 'success');
    }

    context.logs.debug(`Services ${name_str} done.`, 'success');

    return context;
  }

  // Service execution handler.
  static async execService({ service, owner }, context, signature) {
    assert(typeof service === 'function', 'Service to execute must be a function.');
    assert(typeof context === 'object' && context.id, 'Service context must be a context.');
    assert(typeof signature === 'object' && signature.name && signature.version, 'Service signature must be an object.');

    let { name, version } = signature;

    context.set('$current', signature);
    context.sign(`${yellow(name)}#${magenta(version)}`);

    try {
      await service.call(owner, context, cfgStore);
    } catch (error) {
      context.logs.error('Service execution failed.');
      context.logs.error(error.message || error.stack || '');
      context.sign();

      if (!cliargv.erroff) {
        throw error;
      } else {
        context.logs.debug(error.stack, 'error');
      }
    }

    context.sign();
    return context;
  }
}
