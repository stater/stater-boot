'use strict';

exports.__esModule = true;
exports.default = undefined;

var _class, _temp;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _helpers = require('../lib/helpers');

var _services = require('./services');

var _configs = require('./configs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { yellow } = _helpers.logger.color;

let Loaders = (_temp = _class = class Loaders {

  // Configs registrar.
  static registerConfigs(name, config, version) {
    _helpers.logger.debug(`Registering config ${yellow(name)}#${yellow(version)}.`);

    _configs.configs.add(name, config, version);

    if (Array.isArray(config.include)) {
      _helpers.logger.debug(`Registering included configs of ${yellow(name)}#${yellow(version)}...`);

      for (let child of config.include) {
        (0, _assert2.default)((0, _helpers.typeOf)(child) === 'object', 'Included configs must be an object.');

        let { name, version } = child;
        (0, _assert2.default)(typeof name === 'string', 'Including config must have "name" as string.');
        Loaders.registerConfigs(name, child, version);
      }

      _helpers.logger.debug(`Included configs of ${yellow(name)}#${yellow(version)} registered.`);
    }

    _helpers.logger.debug(`Config ${yellow(name)}#${yellow(version)} registered.`);
  }

  // Services loader.
  static loadServices(cwd = process.cwd()) {
    (0, _assert2.default)(typeof cwd === 'string', 'Base dir to find services must be a string.');

    let files = _glob2.default.sync((0, _path.join)(cwd, '**/package.json'));

    files.map(file => {
      this.loadPackage(file, cwd);
    });

    return _services.services;
  }

  // Package loader.
  static loadPackage(pkgpath, cwd) {
    (0, _assert2.default)(typeof pkgpath === 'string', 'Service package path must be a string.');

    try {
      let pkg = require(pkgpath);

      if (pkg.service) {
        let { name, version } = pkg;
        let svcpath = (0, _path.join)((0, _path.dirname)(pkgpath), pkg.service);

        Loaders.loadService(name, version, svcpath, cwd);
      }
    } catch (error) {
      _helpers.logger.error(`Unable to laod service package from ${yellow(pkgpath.replace(`${cwd}/`, ''))}.`);
      throw error;
    }

    return this;
  }

  static loadService(name, version, svcpath, cwd) {

    _helpers.logger.debug(`Registering service ${yellow(`${name}#${version}`)} from ${yellow(svcpath.replace(`${cwd}/`, ''))}.`);

    try {
      let service = require(svcpath);
      this.registerService(name, service, version);
      _helpers.logger.debug(`Service ${yellow(`${name}#${version}`)} registered.`);
    } catch (error) {
      _helpers.logger.error(`Unable to load service ${yellow(`${name}#${version}`)} from ${yellow(svcpath.replace(`${cwd}/`, ''))}.`);
      throw error;
    }
  }

  static registerService(name, service, version) {
    _services.services.add(name, service, version);

    if (Array.isArray(service.include)) {
      for (let child of service.include) {
        (0, _assert2.default)((0, _helpers.typeOf)(child) === 'constructor', 'Included services must be a constructor.');

        let { name, version } = child;
        (0, _assert2.default)(typeof name === 'string', 'Included services must have "name" as string.');
        Loaders.registerService(name, child, version);
      }
    }
  }
}, _class.store = _services.services, _temp);
exports.default = Loaders;
module.exports = exports['default'];