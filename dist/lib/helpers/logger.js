'use strict';

exports.__esModule = true;
exports.logger = exports.Logger = undefined;

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _stripAnsi = require('strip-ansi');

var _stripAnsi2 = _interopRequireDefault(_stripAnsi);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _fsExtra = require('fs-extra');

var _path = require('path');

var _cliSpinner = require('cli-spinner');

var _readCli = require('read-cli');

var _the = require('./the');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Wrap the console to prevent warnings.
const { console: cli } = global;

// Get the default colors.
const { magenta, blue, yellow, xterm, greenBright } = _cliColor2.default;

// Get the environment variables and CLI params.
const { DEBUG, PRINT, LOGS_FORCE, LOGS_DEBUG_ENABLED, LOGS_PRINT_ENABLED } = process.env;
const { env, arg } = (0, _readCli.parse)();

let Logger = exports.Logger = class Logger {

  // Logger constructor.


  // Defining color helper.
  constructor(options = {}) {
    this.config = {
      debug: DEBUG || LOGS_DEBUG_ENABLED || arg.debug || false,
      print: DEBUG || PRINT || LOGS_PRINT_ENABLED || arg.debug || arg.verbose || false,
      write: LOGS_FORCE || (env !== 'development' ? true : false),
      force: LOGS_FORCE || (env !== 'development' ? true : false),

      dtime: true,
      signs: false,
      throw: true,
      prefix: '',
      caller: '',
      callAs: null,
      indent: 0,

      cwd: (0, _path.resolve)(process.cwd(), 'logs')
    };
    this.color = _cliColor2.default;
    this.waiter = {
      done() {},
      fail() {}
    };

    (0, _assert2.default)((0, _the.typeOf)(options) === 'object', `${blue('new')} ${yellow('Logger()')}: ${magenta('options')} should be an object!`);

    Object.assign(this.config, options);
  }

  // Global wait.

  // Defining default configs.


  debug(message) {
    (0, _assert2.default)(typeof message === 'string', `${yellow('logger.debug()')}: ${magenta('message')} should be a string!`);

    const { debug } = this.config;

    if (debug) {
      const { blackBright } = this.color;

      message = this.format(message, blackBright, '[~]');

      this.print(message);
      this.write('debug', message);
    }

    return this;
  }

  log(message, force) {
    this.print(message, force);

    if (typeof message === 'string') {
      return this.write('log', message);
    } else {
      return this;
    }
  }

  info(message) {
    (0, _assert2.default)(typeof message === 'string', `${yellow('logger.info()')}: ${magenta('message')} should be a string!`);

    const { cyan } = this.color;

    message = this.format(message, cyan, '[i]');

    this.print(message);
    return this.write('info', message);
  }

  success(message) {
    (0, _assert2.default)(typeof message === 'string', `${yellow('logger.success()')}: ${magenta('message')} should be a string!`);

    const { xterm } = this.color;

    message = this.format(message, xterm(76), '[✓]');

    this.print(message);
    return this.write('success', message);
  }

  warn(message) {
    (0, _assert2.default)(typeof message === 'string', `${yellow('logger.warn()')}: ${magenta('message')} should be a string!`);

    const { xterm } = this.color;
    const { force } = this.config;

    message = this.format(message, xterm(208), '[!]');

    this.print(message, force);
    return this.write('warn', message, force);
  }

  error(message, error) {
    (0, _assert2.default)(typeof message === 'string', `${yellow('logger.error()')}: ${magenta('message')} should be a string!`);

    const { xterm } = this.color;
    const { force } = this.config;

    message = this.format(message, xterm(196), '[x]');

    this.print(message, force);
    this.write('error', message, force);

    if ((0, _the.typeOf)(error) === 'error' && this.config.throw) {
      throw error;
    }

    return this;
  }

  wait(message) {
    (0, _assert2.default)(typeof message === 'string', `${yellow('logger.wait()')}: ${magenta('message')} should be a string!`);

    const _this = this;

    let msgs = `${this.format(message, xterm(143), '[%s]')}`;
    let spin = new _cliSpinner.Spinner(msgs);

    spin.setSpinnerString(18);
    spin.start();

    return {
      done(info) {
        spin.stop(true);

        _this.success(info || message);
      },

      fail(message, error) {
        spin.stop(true);

        _this.error(message, error);
      }
    };
  }

  await(message) {
    return this.waiter = this.wait(message);
  }

  newline() {
    this.log('');
  }

  as(caller) {
    (0, _assert2.default)(typeof caller === 'string', 'Log as requires for caller.');

    this.config.callAs = caller;
    return this;
  }

  format(message, signColor = xterm(76), signChar = '') {
    (0, _assert2.default)(typeof message === 'string', `${yellow('logger.format()')}: ${magenta('message')} should be a string!`);

    const { prefix, caller, signs, callAs } = this.config;
    const { color } = this;
    const { cyan, xterm } = color;

    let tabs = 0;
    let pref = '';

    message = signColor(message);
    message = message.replace(/^%[\d]+%/, $1 => {
      tabs = Number($1.replace(/%/g, ''));
      return '';
    });

    if (prefix.length > 0) {
      pref = `${cyan(`[${prefix}]`)}${pref}`;
    }

    if (callAs) {
      pref = `[${magenta(callAs)}]${pref}`;
      this.config.callAs = null;
    }

    if (caller.length > 0) {
      pref = `${greenBright(`[${caller}]`)}${pref}`;
    }

    if (signs) {
      pref = `${signColor(signChar)}${pref}`;
    }

    message = this.indent(`${pref.length > 0 ? `${pref} ` : ''}${message}`, tabs > 0 ? tabs : null);

    return message;
  }

  print(message, force) {
    const { print } = this.config;

    if (print || force) {
      if (typeof window === 'undefined') {
        cli.log(message);
      } else {
        cli.log(this.decolor(message));
      }
    }

    return this;
  }

  write(type, message, force) {
    (0, _assert2.default)(typeof type === 'string', `${yellow('logger.write()')}: ${magenta('type')} should be a string!`);
    (0, _assert2.default)(typeof message === 'string', `${yellow('logger.write()')}: ${magenta('message')} should be a string!`);

    const { write, cwd, dtime } = this.config;

    if (write || force) {
      message = (0, _stripAnsi2.default)(message);

      let date = new Date();

      if (dtime) {
        message = `[${date.toLocaleString()} : ${date.getMilliseconds()}]${message}`;
      }

      date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

      let file = (0, _path.resolve)(cwd, `${type}-${date}.log`);

      (0, _fsExtra.ensureFileSync)(file);

      let text = (0, _fsExtra.readFileSync)(file, 'utf8');

      text = `${text}${message}\r\n`;

      (0, _fsExtra.writeFileSync)(file, text);
    }

    return this;
  }

  indent(message, tabs) {
    (0, _assert2.default)(typeof message === 'string', `${yellow('logger.indent()')}: ${magenta('message')} should be a string!`);

    const { indent } = this.config;

    let indentChar = '';

    if (typeof tabs === 'number') {
      for (let i = 1; i <= tabs; ++i) {
        indentChar += ' ';
      }
    } else {
      for (let i = 1; i <= indent; ++i) {
        indentChar += ' ';
      }
    }

    return `${indentChar}${message}`;
  }

  incIndent(size = 2) {
    (0, _assert2.default)(typeof size === 'number', `${yellow('logger.incIndent()')}: ${magenta('size')} should be a number.`);

    this.config.indent += size;

    return this;
  }

  decIndent(size = 2) {
    (0, _assert2.default)(typeof size === 'number', `${yellow('logger.decIndent()')}: ${magenta('size')} should be a number.`);

    this.config.indent -= size;

    return this;
  }

  decolor(text) {
    (0, _assert2.default)(typeof text === 'string', `${yellow('logger.decolor()')}: ${magenta('text')} should be a string.`);

    return (0, _stripAnsi2.default)(text);
  }
};
const logger = exports.logger = new Logger({ signs: true });