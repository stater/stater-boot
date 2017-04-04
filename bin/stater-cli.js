#!/usr/bin/env node

const { join } = require('path');
const { parse } = require('@stater/read-cli');
const { Logger } = require('../dist/lib/helpers');
const Stater = require('../dist/core/stater');

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
  '--signal': 'Send signal to the running services.',
  '-c': 'Set the config file',
  '-d': 'Set the working directory.',
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
    help: null,
    version: null,

    '-s': null,
    '-c': null,
    '-d': null,

    '--signal': 'start',
    '--workdir': null,
    '--config': null
  },
  protect: true
};

const { arg } = parse(confs);

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

    log(`\r\n ${greenBright('Stater Boot')} ${yellow(`v${pkg.version}`)}`);
    log(` ${pkg.description}\r\n`);
    log(` Usage: ${magenta('stater-boot')} ${yellow('[COMMAND][SIGNAL]')} [CONFIG] [OPTIONS]\r\n`);

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
    log(blackBright(' AVAILABLE COMMANDS\tDETAILS'));

    for (let com in comms) {
      log(` ${com}${com.length <= 4 ? '\t\t\t' : '\t\t'}${comms[com]}`);
    }

    log('');
    log(` Example: ${magenta('stater-boot')} -c ${yellow('configs/stater-config.js')} ${blackBright('--verbose')}`);
    log(` Example: ${magenta('stater-boot')} -s ${yellow('reload')}`);
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
                stater.start(`${name}#${version}`).catch(() => {
                  if (!arg.erroff) {
                    process.exit(505);
                  }
                });
              })
              .catch(error => {
                logger.error('Stater boot failed to bootstrap the services.');
                logger.log(error);

                if (!arg.erroff) {
                  process.exit(505);
                }
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
