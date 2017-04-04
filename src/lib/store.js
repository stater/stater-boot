import assert from 'assert';

import { typeOf, suid } from './helpers';
import { split, match, latest } from './helpers/version';
import * as object from './object';

const StoreDatas = {};

export default class VersionStore {
  get type() {
    return null;
  }

  constructor() {
    let id = suid();

    Object.defineProperty(this, 'id', {
      enumerable: false,
      writable: false,
      value: id
    });

    StoreDatas[id] = {};
  }

  // Methods.
  get(name_version) {
    assert(typeOf(name_version) === 'string', this.errinfo.MSG_VER_NAME);

    let { name, version, path } = split(name_version);

    if (this.versions[name]) {
      let versions = Object.keys(this.versions[name]);

      if (versions.length < 1) {
        throw new Error(this.errinfo.MSG_ENOPKG.replace('$1', name));
      }

      if (version) {
        let ver = match(versions, version);

        if (ver) {
          return this.versions[name][ver];
        }
        else {
          throw new Error(this.errinfo.MSG_ENOPKM.replace('$1', `${name}#${version}`));
        }
      }
      else {
        let pkg = this.versions[name][latest(versions)];

        if (path) {
          return object.get(pkg || {}, path);
        }
        else {
          return pkg;
        }
      }
    }
    else {
      throw new Error(this.errinfo.MSG_ENOPKG.replace('$1', name));
    }
  }

  add(svc_name, value, version = '0.0.1') {
    if (typeOf(svc_name) === this.type) {
      let { name, version } = svc_name;
      return this.add(name, svc_name, version);
    } else {
      assert(typeof svc_name === 'string', this.errinfo.MSG_VER_NAME);
      assert(typeOf(value) === this.type, this.errinfo.MSG_VAL_TYPE);
      assert(typeof version === 'string', this.errinfo.MSG_VER_TYPE);

      return this.set(`${svc_name}#${version}`, value);
    }
  }

  set(name_version, value) {
    assert(typeof name_version === 'string', this.errinfo.MSG_VER_NAME);
    assert(typeOf(value) === this.type, this.errinfo.MSG_VAL_TYPE);

    let { name, version } = split(name_version);

    if (name && version) {
      if (!this.versions[name]) {
        this.versions[name] = {};
      }

      this.versions[name][version] = value;
    }
    else {
      throw new TypeError(`${this.name} name or version is invalid: ${name_version}.`);
    }

    return this;
  }

  del(namevsn) {
    assert(typeOf(namevsn) === 'string', this.errinfo.MSG_VER_NAME);

    let { name, version } = split(namevsn);

    if (this.versions[name]) {
      if (!version) {
        version = latest(Object.keys(this.versions[name]));
      }

      if (this.versions[name][version]) {
        delete this.versions[name][version];
      }

      if (Object.keys(this.versions[name]).length < 1) {
        delete this.versions[name];
      }
    }

    return this;
  }

  // Getters
  get errinfo() {
    return {
      MSG_VER_NAME: `${this.name} name/version must be a string.`,
      MSG_VAL_TYPE: `${this.name} value must be ${this.type}.`,
      MSG_VER_TYPE: `${this.name} version must be a string.`,
      MSG_ENOPKG: `${this.name}: $1 does not exist.`,
      MSG_ENOPKM: `${this.name}: No matching version for: $1.`
    };
  }

  get versions() {
    return StoreDatas[this.id];
  }

  get name() {
    return this.constructor.name;
  }
}
