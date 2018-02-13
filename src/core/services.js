import { entries, logger } from '../lib/helpers';
import { VersionStore } from '../lib';
import Service from './constructor';

const CircularRecords = {};

const { yellow, magenta } = logger.color;

export default class ServiceStore extends VersionStore {
  get type() {
    return 'constructor';
  }

  async initialize(stater) {
    // Setup the service.
    Service.setup(stater);

    // Setup the constructors.
    this.setupConstructors(stater);

    // Initialize services.
    await this.initServices();
  }

  setupConstructors() {
    logger.debug('Implementing service constructors...', 'info');

    for (let [name, versions] of entries(this.versions)) {
      for (let [version, service] of entries(versions)) {
        logger.debug(`Implementing service constructors of ${yellow(name)}#${magenta(version)}...`, 'info');

        [
          ['name', name],
          ['version', version],
          ['initialized', true]
        ].forEach(prop => {
          Object.defineProperty(service.prototype, prop[0], {
            enumerable: false,
            writable: false,
            value: prop[1]
          });
        });

        if (typeof service.configs === 'object') {
          Object.defineProperty(service.prototype, 'configs', {
            enumerable: false,
            writable: false,
            value: service.configs
          });
        }

        // Integrate the Service methods.
        for (let method of Service.register) {
          Object.defineProperty(service.prototype, method, {
            enumerable: false,
            writable: false,
            value: Service[method]
          });
        }

        // Assign static signature.
        service.signature = { name, version };

        logger.debug(`Service ${yellow(name)}#${magenta(version)} constructors implemented.`, 'success');
      }
    }

    logger.debug('Service constructors implemented.\r\n', 'success');
  }

  async initServices() {
    for (let name of Object.keys(this.versions)) {
      for (let version of Object.keys(this.versions[name])) {
        await this.initService(name, version);
      }
    }

    return this;
  }

  async initService(name, version, parent) {
    // Getting the service.
    let service = this.versions[name][version];

    // Return the service if already initialized.
    if (service.initialized) {
      return service;
    }

    logger.debug(`Initializing service: ${yellow(name)}#${magenta(version)}${parent ? ` requested by ${parent}` : ''}...`, 'info');

    // If service has dependencies, ensure the dependencies is initialized.
    if (Array.isArray(service.require)) {
      for (let depName of service.require) {
        let dep = this.get(depName);

        if (dep && !dep.initialized) {
          let { name: dn, version: dv } = dep.signature;

          // Creating circular dependency record.
          if (CircularRecords[depName]) {
            CircularRecords[depName] += 1;
          } else {
            CircularRecords[depName] = 1;
          }

          // Throw an error if circular dependency detected.
          if (CircularRecords[depName] >= 2) {
            throw new Error(`ERCDP: Circular dependencies for ${yellow(name)}#${magenta(version)} with ${dn}#${dv} detected!`);
          }

          // Init the dependency service.
          await this.initService(dn, dv, `${name}#${magenta(version)}`);

          // Delete the circular record if dependency initialized.
          delete CircularRecords[depName];
        }
      }
    }

    // Initialize the plguin instance.
    try {
      // Creating service instance.
      let initialized = new service();

      // Configuring service.
      if (typeof initialized.configure === 'function') {
        await initialized.configure();
      }

      // Update the service store.
      this.versions[name][version] = initialized;

      logger.debug(`Service ${yellow(name)}#${magenta(version)} successfully initialized.`, 'success');

      return initialized;
    } catch (err) {
      logger.error(`Unable to initialize service: ${yellow(name)}#${magenta(version)}!`, err);
    }
  }
}

export const services = new ServiceStore();
