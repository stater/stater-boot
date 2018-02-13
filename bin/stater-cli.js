#!/usr/bin/env node

// Increase the error stack trace.
Error.stackTraceLimit = 20;

// Using sourcemap for error info.
require('source-map-support').install();

const { join } = require('path');
const { parse } = require('@stater/read-cli');
const { Logger } = require('../dist/lib/helpers');

const Stater = require('../dist/core/stater');
const Runner = require('../dist/core/runner');

let pkg = require('../package.json');
let cwd = process.cwd();

const logger = new Logger({ print: true, write: false, signs: false });
const { yellow, magenta, greenBright, blackBright } = logger.color;

function log(message) {
  return logger.info(message);
}

const infos = {
  start: 'Start the services (default).',
  reload: 'Reload the running services (on progress).',
  stop: 'Stop the running services (on progress).',

  '-s': 'Send signal to the running services.',
  '-c': 'Set the config file',
  '-d': 'Set the working directory.',
  '--signal': 'Send signal to the running services.',
  '--workdir': 'Set the working directory.',
  '--config': 'Set the config file.',

  '--erroff': 'Force services to keep running even with errors.',
  '--verbose': 'Show more logs.',
  '--debug': 'Show full logs.'
};
const comms = {
  help: 'Show usage helps.',
  version: 'Show the stater-boot version.'
};

const confs = {
  options: ['--verbose', '--debug', '--erroff'],
  configs: {
    run: null,
    help: null,
    version: null,

    '-s': null,
    '-c': null,
    '-d': null,

    '--signal': 'start',
    '--workdir': null,
    '--config': null
  }
};

const { arg, uop } = parse(confs);

if (arg.error) {
  log(arg.error.message);
  process.exit(505);
}

if (arg.d || arg.workdir) {
  cwd = join(cwd, arg.d || arg.workdir);
  logger.debug(`Changing the working directory to ./${yellow(arg.d || arg.workdir)}.`);
  process.chdir(cwd);
}

class StaterCommands {
  static v() {
    StaterCommands.version();
  }

  static version() {
    log(pkg.version);
  }

  static help() {
    let signals = Object.getOwnPropertyNames(StaterSignals).filter(prop => typeof StaterSignals[prop] === 'function');

    log(`\r\n ${greenBright('Stater Boot')}`);
    log(` ${pkg.description}`);
    log(` Version ${yellow(`v${pkg.version}`)}\r\n ---------------------------------------------------------`);
    log(` Usage: ${magenta('stater-boot')} ${yellow('[COMMAND][SERVICES]')} [CONFIG] [OPTIONS]\r\n`);

    log(blackBright(' AVAILABLE COMMANDS\tDETAILS'));

    for (let com in comms) {
      log(` ${com}${com.length <= 4 ? '\t\t\t' : '\t\t'}${comms[com]}`);
    }

    log('');
    log(blackBright(' AVAILABLE CONFIGS\tDETAILS'));

    for (let cfg in confs.configs) {
      if (/^-/.test(cfg)) {
        log(` ${cfg}${cfg.length <= 4 ? '\t\t\t' : '\t\t'}${infos[cfg]}`);
      }
    }

    log('');
    log(blackBright(' AVAILABLE SIGNALS\tDETAILS'));

    for (let signal of signals) {
      if (signal !== 'help') {
        log(` ${signal}${signal.length <= 8 ? '\t\t\t' : '\t\t'}${infos[signal]}`);
      }
    }

    log('');
    log(blackBright(' AVAILABLE OPTIONS\tDETAILS'));

    for (let opt of confs.options) {
      log(` ${opt}${opt.length <= 4 ? '\t\t\t' : '\t\t'}${infos[opt]}`);
    }

    log('');
    log(` Example: ${magenta('stater-boot')} ${yellow('foo bar baz')} ${blackBright('--debug --erroff')}`);
    log(` Example: ${magenta('stater-boot')} -c ${yellow('configs/stater-config.js')} ${blackBright('--verbose')}`);
    log(` Example: ${magenta('stater-boot')} -s ${yellow('reload')}`);

    log('');
    log(` ${blackBright('Copyright © 2017 Stater. For more informations, visit')} ${magenta('https://boot.stater.io')}\r\n`);
  }
}

class StaterSignals {
  static async start(bootsvc) {
    let spkg;

    try {
      spkg = require(join(cwd, 'package.json'));

      if (typeof spkg['stater-boot'] !== 'object') {
        logger.error('You need to run stater-boot on the service project.');
        logger.error('Service project need package.json that contains stater-boot info.');
        process.exit(505);
      }
    } catch (err) {
      logger.error(err.message);
      process.exit();
    }

    if (spkg) {
      let stater = new Stater();
      let { name, version } = spkg;
      let { service, configs } = spkg['stater-boot'];
      let services, config;

      if (service) {
        try {
          services = require(join(cwd, service));
        } catch (error) {
          logger.error(`Unable to load service ${yellow(`${name}#${version}`)} from ./${yellow(service)}.`);
          throw error;
        }
      } else {
        logger.error(`You need to have ${yellow('main')} on the ${magenta('stater-boot')} info.`);
        process.exit(505);
      }

      if (configs) {
        try {
          config = require(join(cwd, configs));
        } catch (error) {
          logger.error(`Unable to load configs from ./${yellow(configs)}.`);
          process.exit(505);
        }
      }

      if (services) {
        try {
          await stater.bootstrap(name, services, (config || []), version);
          try {
            await Runner.start(bootsvc || `${name}#${version}`);
          } catch (error) {
            if (!arg.erroff) {
              logger.error('\r\nStater Boot failed to start the services. \r\nCheck the log file or add --debug to see the error details.');
              logger.debug(error.stack);
              process.exit(505);
            }
          }
        } catch (error) {
          logger.error('Stater Boot failed to bootstrap the the services. \r\nCheck the log file or add --debug to see the error details.');

          if (!arg.erroff) {
            logger.debug(error.stack);
            process.exit(505);
          }
        }
      }
    }
  }

  static reload() {
    logger.info('This feature is not available yet. Keep in touch!');
  }

  static stop() {
    logger.info('This feature is not available yet. Keep in touch!');
  }
}

if (!StaterCommands[arg.command]) {
  let signal = arg.s || arg.signal;
  let config = arg.c || arg.config;

  if (uop.length > 0) {
    StaterSignals.start(uop.length === 1 ? uop[0] : uop);
  } else {
    if (typeof StaterSignals[signal] === 'function') {
      StaterSignals[signal](config);
    } else {
      logger.error(`Unknown signal: ${signal}.\r\n`);
      StaterCommands.help();
      process.exit(505);
    }
  }
} else {
  if (typeof StaterCommands[arg.command] === 'function') {
    StaterCommands[arg.command]();
  } else {
    logger.error(`Unknown command: ${arg.command}.\r\n`);
    StaterCommands.help();
    process.exit(505);
  }
}
