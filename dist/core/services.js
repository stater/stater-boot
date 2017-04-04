'use strict';

exports.__esModule = true;
exports.services = exports.default = undefined;

var _helpers = require('../lib/helpers');

var _lib = require('../lib');

var _constructor = require('./constructor');

var _constructor2 = _interopRequireDefault(_constructor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const CircularRecords = {};

const { yellow, magenta } = _helpers.logger.color;

let ServiceStore = class ServiceStore extends _lib.VersionStore {
  get type() {
    return 'constructor';
  }

  initialize(stater) {
    var _this = this;

    return _asyncToGenerator(function* () {
      // Setup the service.
      _constructor2.default.setup(stater);

      // Setup the constructors.
      _this.setupConstructors(stater);

      // Initialize services.
      yield _this.initServices();
    })();
  }

  setupConstructors() {
    _helpers.logger.debug('Implementing service constructors...');

    for (let [name, versions] of (0, _helpers.entries)(this.versions)) {
      for (let [version, service] of (0, _helpers.entries)(versions)) {
        _helpers.logger.debug(`Implementing service constructors of ${yellow(name)}#${magenta(version)}...`);

        [['name', name], ['version', version], ['initialized', true]].forEach(prop => {
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
        for (let method of _constructor2.default.register) {
          Object.defineProperty(service.prototype, method, {
            enumerable: false,
            writable: false,
            value: _constructor2.default[method]
          });
        }

        // Assign static signature.
        service.signature = { name, version };

        _helpers.logger.debug(`Service ${yellow(name)}#${magenta(version)} constructors implemented.`);
      }
    }

    _helpers.logger.debug('Service constructors implemented.\r\n');
  }

  initServices() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      for (let name of Object.keys(_this2.versions)) {
        for (let version of Object.keys(_this2.versions[name])) {
          yield _this2.initService(name, version);
        }
      }

      return _this2;
    })();
  }

  initService(name, version, parent) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      // Getting the service.
      let service = _this3.versions[name][version];

      // Return the service if already initialized.
      if (service.initialized) {
        return service;
      }

      _helpers.logger.debug(`Initializing service: ${yellow(name)}#${magenta(version)}${parent ? ` requested by ${parent}` : ''}...`);

      // If service has dependencies, ensure the dependencies is initialized.
      if (Array.isArray(service.require)) {
        for (let depName of service.require) {
          let dep = _this3.get(depName);

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
            yield _this3.initService(dn, dv, `${name}#${magenta(version)}`);

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
          yield initialized.configure();
        }

        // Update the service store.
        _this3.versions[name][version] = initialized;

        _helpers.logger.debug(`Service ${yellow(name)}#${magenta(version)} successfully initialized.`);

        return initialized;
      } catch (err) {
        _helpers.logger.error(`Unable to initialize service: ${yellow(name)}#${magenta(version)}!`, err);
      }
    })();
  }
};
exports.default = ServiceStore;
const services = exports.services = new ServiceStore();