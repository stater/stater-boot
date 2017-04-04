import assert from 'assert';
import typeOf from 'jsmicro-typeof';
import { the } from './the';
import get from '../object/getter';

const REGX_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
const REGX_ARGUMENT = /([^\s,]+)/g;

class Factory {
  constructor(fn) {
    assert(typeof fn === 'function', 'Factory function should be a function.');

    this.fn = fn;
  }

  get args() {
    const { $require } = this.fn;

    if (Array.isArray($require)) {
      return $require;
    } else {
      let fnStr = this.fn.toString().replace(REGX_COMMENTS, '');
      let args = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(REGX_ARGUMENT);

      return args === null ? [] : args;
    }
  }

  parse(sources, inmodule = false) {
    assert(the(sources).is(['array', 'object']), 'Sources should be an array or an object.');

    let result = [];
    let { args } = this;

    if (Array.isArray(sources)) {
      for (let source of sources) {
        args.forEach((key, i) => {
          let value = get(source, key);

          if (value) {
            result[i] = value;
          } else {
            if (!result[i]) {
              result[i] = undefined;
            }
          }
        });
      }
    } else if (typeOf(sources) === 'object') {
      args.forEach((key, i) => {
        let value = get(sources, key);

        if (value) {
          result[i] = value;
        } else {
          if (!result[i]) {
            result[i] = undefined;
          }
        }
      });
    }

    result.map(value => {
      if (typeof value === 'undefined' && inmodule) {
        try {
          return require(args[result.indexOf(value)]);
        } catch (err) {
          throw err;
        }
      } else {
        if (!value) {
          return undefined;
        }
      }
    });

    return result;
  }
}

export default function factory(fn) {
  return new Factory(fn);
}
