import assert from 'assert';

import { typeOf, entries, logger, suid } from '../lib/helpers';
import { merge } from '../lib/object';
import { split } from '../lib/helpers/version';
import VersionStore from '../lib/store';

let { yellow } = logger.color;

const configurators = {};

export default class ConfigStore extends VersionStore {
  get type() {
    return 'object';
  }

  set(name_version, value) {
    assert(typeof name_version === 'string', this.errinfo.MSG_VER_NAME);
    assert(typeOf(value) === 'object', this.errinfo.MSG_VAL_TYPE);

    let { name, version } = split(name_version);

    if (name && version) {
      let nv = `${name}#${version}`;

      if (!this.versions[name]) {
        this.versions[name] = {};
      }

      if (typeof value.reconfigure === 'function') {
        if (!configurators[nv]) {
          configurators[nv] = [];
        }

        configurators[nv].push(value.reconfigure);
      }

      if (!this.versions[name][version]) {
        Object.defineProperty(value, 'name', { enumerable: false, writable: false, value: name });
        Object.defineProperty(value, 'version', { enumerable: false, writable: false, value: version });

        this.versions[name][version] = value;
      } else {
        delete value.name;
        delete value.version;

        merge(this.versions[name][version], value);
      }

      if (configurators[nv]) {
        this.versions[name][version].reconfigure = configurators[nv];
      }
    }
    else {
      throw new Error(`${this.name} name or version is invalid: ${name_version}.`);
    }

    return this;
  }

  async reconfigure() {
    let hash = suid();

    for (let [name, versions] of entries(this.versions)) {
      for (let version in versions) {
        await this.configure(name, version, hash);
      }
    }

    return this;
  }

  async configure(name, version, hash) {
    assert(typeof name === 'string', 'ConfigStore: configure: name must be a string.');
    assert(typeof hash === 'string', 'ConfigStore: configure: hash must be a string.');

    let config = this.get(typeof version === 'string' ? `${name}#${version}` : name);

    if (Array.isArray(config.reconfigure)) {
      for (let reconfigure of config.reconfigure) {
        if (typeof reconfigure === 'function') {
          if (reconfigure.hash && reconfigure.hash === hash) {
            return;
          }

          logger.debug(`Reconfiguring config ${yellow(`${name}#${version || 'latest'}`)}...`, 'info');

          if (Array.isArray(reconfigure.require)) {
            for (let dname of reconfigure.require) {
              await this.configure(dname, null, hash);
            }
          }

          try {
            await reconfigure(config, this);
          } catch (error) {
            logger.error(`Reconfiguring ${yellow(`${name}#${version || 'latest'}`)} failed.`);
            throw error;
          }

          config.reconfigure.hash = hash;

          logger.debug(`Config ${yellow(`${name}#${version || 'latest'}`)} successfully reconfigured.`, 'success');
        } else {
          logger.debug(`Config ${yellow(`${name}#${version}`)} doesn't need to be reconfigured.`);
        }
      }
    } else {
      logger.debug(`Config ${yellow(`${name}#${version}`)} doesn't need to be reconfigured.`);
    }

    return this;
  }
}

export const configs = new ConfigStore();
