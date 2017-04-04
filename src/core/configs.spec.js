const { describe, it } = global;

import assert from 'assert';
import ConfigStore from './configs';

let cs = new ConfigStore();

function reconfigure(config, store) {
  let bar = store.get('bar');

  if (bar.env === 'production') {
    config.dist = 'build';
  } else if (bar.env === 'staging') {
    config.dist = 'stags';
  }

  return config;
}

reconfigure.require = ['bar'];

cs.add('baz', {
  dist: 'temp',
  reconfigure
});

cs.add('foo', {
  host: 'localhost',
  port: 8080
});

cs.add('bar', {
  env: 'development',
  reconfigure(config, store) {
    let foo = store.get('foo');

    if (foo.port === 8080) {
      config.env = 'production';
    }

    return config;
  }
});

describe('ConfigStore => new ConfigStore()', () => {
  it('Instance name should be ConfigStore', () => {
    let pkg = new ConfigStore();

    assert.equal(pkg.name, 'ConfigStore');
  });
});

describe('ConfigStore => reconfigure()', () => {
  it('Should reconfigure, using latest version of required configs.', () => {
    let baz = cs.get('baz');

    cs.reconfigure().then(() => {
      assert.equal(baz.dist, 'build');
    });
  });

  it('Should reconfigure, using custom version of required configs.', () => {
    cs.add('bar', { env: 'staging' }, '1.0.0');

    let baz = cs.get('baz');
    baz.reconfigure.require = ['bar#^1.0.0'];

    cs.reconfigure().then(() => {
      assert.equal(baz.dist, 'stags');
    });
  });
});
