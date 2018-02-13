import color from 'cli-color';
import ansi from 'strip-ansi';
import assert from 'assert';

import { ensureFileSync, readFileSync, writeFileSync } from 'fs-extra';
import { resolve } from 'path';
import { Spinner } from 'cli-spinner';
import { parse } from '@stater/read-cli';
import { typeOf } from './the';

// Wrap the console to prevent warnings.
const { console: cli } = global;

// Get the default colors.
const { magenta, blue, yellow, xterm } = color;

// Get the environment variables and CLI params.
const { DEBUG, PRINT, LOGS_FORCE, LOGS_DEBUG_ENABLED, LOGS_PRINT_ENABLED } = process.env;
const { env, arg } = parse();

const devcolor = {
  log: '#fff',
  info: '#0072bc',
  debug: '#999999',
  success: 'green',
  warn: 'yellow',
  error: 'red'
};

export class Logger {
  // Defining default configs.
  config = {
    debug: DEBUG || LOGS_DEBUG_ENABLED || arg.debug || false,
    print: DEBUG || LOGS_DEBUG_ENABLED || PRINT || LOGS_PRINT_ENABLED || arg.debug || arg.verbose || false,
    write: LOGS_FORCE || (env !== 'development' ? true : false),
    force: LOGS_FORCE || (env !== 'development' ? true : false),

    dtime: true,
    signs: false,
    throw: true,

    prefix: '',
    caller: '',
    callAs: null,
    indent: 0,

    cwd: resolve(process.cwd(), 'logs')
  };

  // Defining color helper.
  color = color;

  // Global wait.
  waiter = {
    done() {},
    fail() {}
  }

  // Logger constructor.
  constructor(options = {}) {
    assert(typeOf(options) === 'object', `${blue('new')} ${yellow('Logger()')}: ${magenta('options')} should be an object!`);

    Object.assign(this.config, options);
  }

  debug(message, sign) {
    assert(typeof message === 'string', `${yellow('logger.debug()')}: ${magenta('message')} should be a string!`);

    const { debug } = this.config;
    const signs = { info: '[i]', error: '[!]', success: '[✓]' };

    if (debug) {
      const { blackBright } = this.color;

      message = this.format(message, blackBright, sign ? signs[sign] : '[~]');

      this.print(message, false, 'debug');
      this.write('debug', message);
    }

    return this;
  }

  log(message, force) {
    this.print(message, force, 'log');

    if (typeof message === 'string') {
      return this.write('log', message);
    } else {
      return this;
    }
  }

  info(message) {
    assert(typeof message === 'string', `${yellow('logger.info()')}: ${magenta('message')} should be a string!`);

    const { cyan } = this.color;

    message = this.format(message, cyan, '[i]');

    this.print(message, false, 'info');
    return this.write('info', message);
  }

  success(message) {
    assert(typeof message === 'string', `${yellow('logger.success()')}: ${magenta('message')} should be a string!`);

    const { xterm } = this.color;

    message = this.format(message, xterm(76), '[✓]');

    this.print(message, false, 'success');
    return this.write('success', message);
  }

  warn(message) {
    assert(typeof message === 'string', `${yellow('logger.warn()')}: ${magenta('message')} should be a string!`);

    const { xterm } = this.color;
    const { force } = this.config;

    message = this.format(message, xterm(208), '[!]');

    this.print(message, force, 'warn');
    return this.write('warn', message, force);
  }

  error(message, error) {
    assert(typeof message === 'string', `${yellow('logger.error()')}: ${magenta('message')} should be a string!`);

    const { xterm } = this.color;
    const { force } = this.config;

    message = this.format(message, xterm(196), '[x]');

    this.print(message, force, 'error');
    this.write('error', message, force);

    if (typeOf(error) === 'error' && this.config.throw) {
      throw error;
    }

    return this;
  }

  wait(message) {
    assert(typeof message === 'string', `${yellow('logger.wait()')}: ${magenta('message')} should be a string!`);

    const _this = this;

    let msgs = `${this.format(message, xterm(143), '[%s]')}`;
    let spin = new Spinner(msgs);

    spin.setSpinnerString(16);
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
    assert(typeof caller === 'string', 'Log as requires for caller.');

    this.config.callAs = caller;
    return this;
  }

  format(message, signColor = xterm(76), signChar = '') {
    assert(typeof message === 'string', `${yellow('logger.format()')}: ${magenta('message')} should be a string!`);

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
      pref = `[${xterm(75)(callAs)}]${pref}`;
      this.config.callAs = null;
    }

    if (caller.length > 0) {
      pref = `${xterm(24)(`[${caller}]`)}${pref}`;
    }

    if (signs) {
      pref = `${signColor(signChar)}${pref}`;
    }

    message = this.indent(`${pref.length > 0 ? `${pref} ` : ''}${message}`, (tabs > 0 ? tabs : null));

    return message;
  }

  print(message, force, type) {
    const { print } = this.config;

    if (print || force) {
      if (typeof window === 'undefined') {
        if (!process.env.NOCOLOR) {
          cli.log(message);
        } else {
          cli.log(`%c${this.decolor(message)}`, `color: ${devcolor[type]}`);
        }
      } else {
        cli.log(this.decolor(message));
      }
    }

    return this;
  }

  write(type, message, force) {
    assert(typeof type === 'string', `${yellow('logger.write()')}: ${magenta('type')} should be a string!`);
    assert(typeof message === 'string', `${yellow('logger.write()')}: ${magenta('message')} should be a string!`);

    const { write, cwd, dtime } = this.config;

    if (write || force) {
      message = ansi(message);

      let date = new Date();

      if (dtime) {
        message = `[${date.toLocaleString()} : ${date.getMilliseconds()}]${message}`;
      }

      date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

      let file = resolve(cwd, `${type}-${date}.log`);

      ensureFileSync(file);

      let text = readFileSync(file, 'utf8');

      text = `${text}${message}\r\n`;

      writeFileSync(file, text);
    }

    return this;
  }

  indent(message, tabs) {
    assert(typeof message === 'string', `${yellow('logger.indent()')}: ${magenta('message')} should be a string!`);

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
    assert(typeof size === 'number', `${yellow('logger.incIndent()')}: ${magenta('size')} should be a number.`);

    this.config.indent += size;

    return this;
  }

  decIndent(size = 2) {
    assert(typeof size === 'number', `${yellow('logger.decIndent()')}: ${magenta('size')} should be a number.`);

    this.config.indent -= size;

    return this;
  }

  decolor(text) {
    assert(typeof text === 'string', `${yellow('logger.decolor()')}: ${magenta('text')} should be a string.`);

    return ansi(text);
  }
}

export const logger = new Logger({ signs: true });
