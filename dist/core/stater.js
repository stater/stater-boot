'use strict';

exports.__esModule = true;
exports.default = undefined;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _helpers = require('../lib/helpers');

var _event = require('../lib/event');

var _configs = require('./configs');

var _services = require('./services');

var _loader = require('./loader');

var _loader2 = _interopRequireDefault(_loader);

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { yellow, magenta } = _helpers.logger.color;

let Stater = class Stater {
  constructor() {
    this.configs = _configs.configs;
    this.services = _services.services;
    this.initialized = false;
  }

  // Service event emitter.
  emit(event, callback) {
    (0, _assert2.default)(typeof event === 'string', 'Event name must be a string.');

    event.emit(event, callback);

    return this;
  }

  // Service event listener.
  listenEvent() {
    var _this = this;

    _event.event.on('start', (() => {
      var _ref = _asyncToGenerator(function* (services, callback) {
        (0, _assert2.default)(Array.isArray(services) || typeof services === 'string', 'Services to start must be an array or string.');

        let context = yield _this.start(services);

        if (typeof callback === 'function') {
          callback(context);
        }
      });

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    })());

    _event.event.on('start-service', (() => {
      var _ref2 = _asyncToGenerator(function* (services, callback) {
        (0, _assert2.default)(Array.isArray(services) || typeof services === 'string', 'Services to start must be an array or string.');

        let concurrencies = yield _this.concurrent(services);

        if (typeof callback === 'function') {
          callback(concurrencies);
        }
      });

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    })());
  }

  // Service bootstrapper.
  bootstrap(name, service, configs, version) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      (0, _assert2.default)(typeof name === 'string', 'Service name to bootstrap must be as tring.');
      (0, _assert2.default)((0, _helpers.typeOf)(service) === 'constructor', 'Service to bootstrap must be a constructor.');
      (0, _assert2.default)(Array.isArray(configs) || (0, _helpers.typeOf)(configs) === 'object', 'Bootstrap must provide object config or array configs.');

      // Registering bootstrap service.
      _helpers.logger.debug(`Registering bootstrap service ${yellow(`${name}#${version || '0.0.1'}`)}...`);
      _loader2.default.registerService(name, service, version);
      _helpers.logger.debug(`Bootstrap ${yellow(`${name}#${version || '0.0.1'}`)} registered.`);

      // Registering global services.
      _helpers.logger.debug('Registering global services...');
      _loader2.default.loadServices();
      _helpers.logger.debug('Global services registered.');

      // Registering default configs.
      _helpers.logger.debug('Registering default configs...');
      yield _this2.defaults();
      _helpers.logger.debug('Default configs registerd.');

      // Registering configs.
      _helpers.logger.debug('Registering user\'s configs...');
      yield _this2.configure(configs);
      _helpers.logger.debug('User\'s configs registerd.');

      // Reconfiguring configs.
      _helpers.logger.debug('Reconfiguring configs...');
      yield _this2.reconfigure();
      _helpers.logger.debug('Configs reconfigured.');

      // Initializing services.
      _helpers.logger.debug('Initializing services...');
      yield _this2.initialize();
      _helpers.logger.debug('Services initialized.');

      _helpers.logger.info('Stater bootstraped.');
    })();
  }

  // Service initializer.
  initialize() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      yield _this3.services.initialize(_this3);

      _this3.initialized = true;
      _helpers.logger.info('Stater initialized.');

      return _this3;
    })();
  }

  // Default service's configs handler.
  defaults() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      // Registering default configs.
      for (let [name, versions] of (0, _helpers.entries)(_services.services.versions)) {
        for (let [, service] of (0, _helpers.entries)(versions)) {
          if (typeof service.configs === 'object') {
            _this4.configs.add(name, service.configs);
          }
        }
      }

      return _this4;
    })();
  }

  // Configs setup handler.
  configure(configs) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      if (Array.isArray(configs)) {
        for (let config of configs) {
          yield _this5.configure(config);
        }
      } else if ((0, _helpers.typeOf)(configs) === 'object') {
        let { name, version } = configs;
        (0, _assert2.default)(typeof name === 'string', 'Config name to add must be a string.');
        _loader2.default.registerConfigs(name, configs, version);
      }

      if (_this5.initialized) {
        yield _this5.reconfigure();
      }

      return _this5;
    })();
  }

  // Configs reconfigure handler.
  reconfigure() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      // Reconfiguring configs.
      yield _this6.configs.reconfigure();

      // Applying new configs to services.
      for (let [name, versions] of (0, _helpers.entries)(_services.services.versions)) {
        for (let [, service] of (0, _helpers.entries)(versions)) {
          if (typeof service.configs === 'object') {
            let config = _this6.configs.get(name);

            if (config) {
              service.configs = config;
            }
          }
        }
      }

      return _this6;
    })();
  }

  // Asynchronus paralel service(s) runner.
  concurrent(services, context) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      (0, _assert2.default)(Array.isArray(services) || typeof services === 'string', 'Service to run in background must be an array or string.');

      if (!context) {
        context = new _context2.default(_this7);
      }

      if (Array.isArray(services)) {
        return services.map(function (service) {
          return new Promise(function (resolve, reject) {
            _this7.start(service, context).then(resolve).catch(reject);
          });
        });
      } else {
        return _this7.start(services, context);
      }
    })();
  }

  // Asynchronus service(s) runner.
  start(services, context) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      (0, _assert2.default)(Array.isArray(services) || typeof services === 'string', 'Service to start must be an array or string.');

      if (!context) {
        context = new _context2.default(_this8);
      }

      if (Array.isArray(services)) {
        for (let service of services) {
          (0, _assert2.default)(typeof service === 'string', 'Services in array must be a string service name(#version).');

          try {
            yield _this8.start(service, context);
          } catch (error) {
            throw error;
          }
        }
      } else if (typeof services === 'string') {
        let service = _this8.services.get(services);
        let { name, version } = service;
        let signature = { name, version };

        context.logs.debug(`Starting service ${yellow(name)}#${magenta(version)}...`);

        if (Array.isArray(service.beforeRun)) {
          context.logs.debug(`Starting beforeRun services of ${yellow(name)}#${magenta(version)}...`);

          for (let child of service.beforeRun) {
            if (typeof child === 'string') {
              try {
                yield _this8.start(child, context);
              } catch (error) {
                throw error;
              }
            } else {
              try {
                yield _this8.exec({ service: child, owner: service }, context, signature);
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
            yield _this8.exec({ service: service.service, owner: service }, context, signature);
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
                yield _this8.start(child, context);
              } catch (error) {
                throw error;
              }
            } else if (typeof child === 'function') {
              try {
                yield _this8.exec({ service: child, owner: service }, context, signature);
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
                yield _this8.start(child, context);
              } catch (error) {
                throw error;
              }
            } else {
              try {
                yield _this8.exec({ service: child, owner: service }, context, signature);
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
    })();
  }

  // Service execution handler.
  exec({ service, owner }, context, signature) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      (0, _assert2.default)(typeof service === 'function', 'Service to execute must be a function.');
      (0, _assert2.default)(typeof context === 'object' && context.id, 'Service context must be a context.');
      (0, _assert2.default)(typeof signature === 'object' && signature.name && signature.version, 'Service signature must be an object.');

      let { name, version } = signature;

      context.sign(`${yellow(name)}#${magenta(version)}`);
      try {
        yield service.call(owner, context, _this9.configs);
      } catch (err) {
        try {
          yield service(context, _this9.configs);
        } catch (error) {
          context.logs.error('Service execution failed.');
          throw error;
        }
      }
      context.sign();

      return context;
    })();
  }
};
exports.default = Stater;
module.exports = exports['default'];