#!/usr/bin/env node

const { join } = require('path');
const { parse } = require('@stater/read-cli');
const { Logger } = require('../dist/lib/helpers');
const Stater = require('../dist/core/stater');

const pkg = require('../package.json');
const cwd = process.cwd();

const logger = new Logger({ print: true, write: false, signs: false });
const { yellow, magenta, greenBright, blackBright } = logger.color;
function log(message) {
  return logger.info(message);
}

const infos = {
  start: 'Start the services (default).',
  reload: 'Reload the running services (on progress).',
  stop: 'Stop the running services (on progress).',

  '--verbose': 'Show more logs.',
  '--debug': 'Show full logs.'
};
const comms = {
  help: 'Show usage helps.'
};
const confs = {
  options: ['--verbose', '--debug'],
  configs: {
    help: null,
    version: null,
    '-v': null,
    '-c': null,
    '--config': null,
    '-s': null,
    '--signal': 'start'
  },
  protect: true
};

const { arg } = parse(confs);

if (arg.error) {
  log(arg.error.message);
  process.exit(505);
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

    log(`\r\n ${greenBright('Stater Boot')} ${yellow(`v${pkg.version}`)}`);
    log(` ${pkg.description}\r\n`);
    log(` Usage: ${magenta('stater')} ${yellow('[COMMAND][SIGNAL]')} [CONFIG][OPTIONS]\r\n`);

    log(blackBright(' AVAILABLE SIGNALS\tDETAILS'));

    for (let signal of signals) {
      if (signal !== 'help') {
        log(` ${signal}\t\t\t${infos[signal]}`);
      }
    }

    log('');
    log(blackBright(' AVAILABLE OPTIONS\tDETAILS'));

    for (let opt of confs.options) {
      log(` ${opt}\t\t${infos[opt]}`);
    }

    log('');
    log(blackBright(' AVAILABLE COMMANDS\tDETAILS'));

    for (let com in comms) {
      log(` ${com}\t\t\t${comms[com]}`);
    }

    log('');
    log(` Example: ${magenta('stater')} -c ${yellow('configs/stater-config.js')} ${blackBright('--verbose')}`);
    log(` Example: ${magenta('stater')} -s ${yellow('reload')}`);
  }
}

class StaterSignals {
  static start() {
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
      let { service, config } = spkg['stater-boot'];
      let services, configs;

      if (service) {
        try {
          services = require(join(cwd, service));
        } catch (error) {
          logger.error(`Unable to load service ${yellow(`${name}#${version}`)} from ./${yellow(service)}.`);
          process.exit(505);
        }
      } else {
        logger.error(`You need to have ${yellow('main')} on the ${magenta('stater-boot')} info.`);
        process.exit(505);
      }

      if (config) {
        try {
          configs = require(join(cwd, config));
        } catch (error) {
          logger.error(`Unable to load configs from ./${yellow(config)}.`);
          process.exit(505);
        }
      }

      if (services) {
        stater.bootstrap(name, services, configs, version)
              .then(() => {
                stater.start(`${name}#${version}`).catch(err => {
                  throw err;
                });
              })
              .catch(err => {
                throw err;
              });
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

  if (typeof StaterSignals[signal] === 'function') {
    StaterSignals[signal](config);
  } else {
    logger.error(`Unknown signal: ${signal}.\r\n`);
    StaterCommands.help();
    process.exit(505);
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
