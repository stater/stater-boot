import assert from 'assert';
import { join, dirname } from 'path';
import glob from 'glob';

import { logger, typeOf } from '../lib/helpers';
import { services } from './services';
import { configs } from './configs';

const { yellow } = logger.color;

export default class Loaders {
  static store = services;

  // Configs registrar.
  static registerConfigs(name, config, version) {
    logger.debug(`Registering config ${yellow(name)}#${yellow(version)}.`, 'info');

    configs.add(name, config, version);

    if (Array.isArray(config.include)) {
      logger.debug(`Registering included configs of ${yellow(name)}#${yellow(version)}...`, 'info');

      for (let child of config.include) {
        assert(typeOf(child) === 'object', 'Included configs must be an object.');

        let { name, version } = child;
        assert(typeof name === 'string', 'Including config must have "name" as string.');
        Loaders.registerConfigs(name, child, version);
      }

      logger.debug(`Included configs of ${yellow(name)}#${yellow(version)} registered.`, 'success');
    }

    logger.debug(`Config ${yellow(name)}#${yellow(version)} registered.`, 'success');
  }

  // Services loader.
  static loadServices(cwd = process.cwd()) {
    assert(typeof cwd === 'string', 'Base dir to find services must be a string.');

    let files = glob.sync(join(cwd, '**/package.json'));

    files.map(file => {
      this.loadPackage(file, cwd);
    });

    return services;
  }

  // Package loader.
  static loadPackage(pkgpath, cwd) {
    assert(typeof pkgpath === 'string', 'Service package path must be a string.');

    try {
      let pkg = require(pkgpath);

      if (pkg.service) {
        let { name, version } = pkg;
        let svcpath = join(dirname(pkgpath), pkg.service);

        Loaders.loadService(name, version, svcpath, cwd);
      }
    } catch (error) {
      logger.error(`Unable to laod service package from ${yellow(pkgpath.replace(`${cwd}/`, ''))}.`);
      throw error;
    }

    return this;
  }

  static loadService(name, version, svcpath, cwd) {

    logger.debug(`Registering service ${yellow(`${name}#${version}`)} from ${yellow(svcpath.replace(`${cwd}/`, ''))}.`, 'info');

    try {
      let service = require(svcpath);
      this.registerService(name, service, version);
      logger.debug(`Service ${yellow(`${name}#${version}`)} registered.`, 'success');
    } catch (error) {
      logger.error(`Unable to load service ${yellow(`${name}#${version}`)} from ${yellow(svcpath.replace(`${cwd}/`, ''))}.`);
      throw error;
    }
  }

  static registerService(name, service, version) {
    services.add(name, service, version);

    if (Array.isArray(service.include)) {
      for (let child of service.include) {
        assert(typeOf(child) === 'constructor', 'Included services must be a constructor.');

        let { name, version } = child;
        assert(typeof name === 'string', 'Included services must have "name" as string.');
        Loaders.registerService(name, child, version);
      }
    }
  }
}
