const { describe, it } = global;

import assert from 'assert';
import ServiceStore from './services';

let svc = new ServiceStore();

class Foo {
  static require = ['a', 'a#~0.0.1'];
  configs = {
    host: 'localhost',
    port: 8080,
    assets: {
      scripts: [],
      images: []
    }
  };
}

class bar {}

describe('ServiceStore => new ServiceStore()', () => {
  it('Instance name should be ServiceStore', () => {
    assert.equal(svc.name, 'ServiceStore');
  });

  it('Should fails to register a non constructor service.', (done) => {
    try {
      svc.add('test', () => {});
    } catch (err) {
      done();
    }
  });

  it('Should add service with default version.', () => {
    svc.add('foo', Foo);

    assert.ok(
      svc.versions.hasOwnProperty('foo') &&
      svc.versions['foo'].hasOwnProperty('0.0.1') &&
      svc.versions['foo']['0.0.1'] === Foo
    );
  });

  it('Should add service with inline signature.', () => {
    svc.add(bar);

    assert.ok(
      svc.versions.hasOwnProperty('bar') &&
      svc.versions['bar'].hasOwnProperty('0.0.1') &&
      svc.versions['bar']['0.0.1'] === bar
    );
  });

  it('Should add service with inline signature and custom version.', () => {
    class baz {
      static version = '1.0.0';
    }

    svc.add(baz);

    assert.ok(
      svc.versions.hasOwnProperty('baz') &&
      svc.versions['baz'].hasOwnProperty('1.0.0') &&
      svc.versions['baz']['1.0.0'] === baz
    );
  });
});
