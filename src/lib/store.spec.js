const { describe, it } = global;

import assert from 'assert';
import Version from './store';

class VersionStore extends Version {
  get type() {
    return 'constructor';
  }
}

let Pkg = new VersionStore();

class Test {
  static version = '0.0.1';
}

class Test2 {
  static version = '1.0.0';
}

describe('VersionStore => new VersionStore()', () => {
  it('Should create a new VersionStore instance.', () => {
    let pkg = new VersionStore();

    assert.ok(pkg.versions !== undefined);
  });

  it('VersionStore instance should has readonly "versions" property.', (done) => {
    let pkg = new VersionStore();

    try {
      pkg.versions = 'override';
    } catch (err) {
      done();
    }
  });
});

describe('VersionStore => add(name, package, ?version)', () => {
  it('Should fails to add new package without arguments.', (done) => {
    try {
      Pkg.add();
    } catch (err) {
      done();
    }
  });

  it('Should fails to add new package without a valid name.', (done) => {
    try {
      Pkg.add(10);
    } catch (err) {
      done();
    }
  });

  it('Should fails to add new package without a value.', (done) => {
    try {
      Pkg.add('test');
    } catch (err) {
      done();
    }
  });

  it('Should fails to add new package without a valid value.', (done) => {
    try {
      Pkg.add('test', 'test');
    } catch (err) {
      done();
    }
  });

  it('Should fails to add new package with invalid version.', (done) => {
    try {
      Pkg.add('test', Test, 1.0);
    } catch (err) {
      done();
    }
  });

  it('Should add new package with default version, and the package must correct.', () => {
    let name = 'test';
    let version = '0.0.1';

    Pkg.add(name, Test);

    assert.ok(Pkg.versions.hasOwnProperty(name) && Pkg.versions[name].hasOwnProperty(version));
    assert.equal(Pkg.versions[name][version], Test);
  });

  it('Should add new package with custom version, and the package must correct.', () => {
    let name = 'test';
    let version = '1.0.0';

    Pkg.add(name, Test, version);

    assert.ok(Pkg.versions.hasOwnProperty(name) && Pkg.versions[name].hasOwnProperty(version));
    assert.equal(Pkg.versions[name][version], Test);
  });

  it('Should replace the existing package.', () => {
    let name = 'test';
    let version = '1.0.0';

    Pkg.add(name, Test2, version);

    assert.equal(Pkg.versions[name][version], Test2);
  });
});

describe('VersionStore => set(name#version, package)', () => {
  it('Should fails when using set() with invalid name#version', (done) => {
    try {
      Pkg.set('test', Test);
    } catch (err) {
      done();
    }
  });

  it('Should fails when using set() without a valid package.', (done) => {
    try {
      Pkg.set('test#0.0.1', 10);
    } catch (err) {
      done();
    }
  });

  it('Should replace the existing package.', () => {
    let name = 'test';
    let version = '0.0.1';

    Pkg.set(`${name}#${version}`, Test2);

    assert.equal(Pkg.versions[name][version], Test2);
  });
});

describe('VersionStore => get(name#version)', () => {
  it('Should fails to get package without name.', (done) => {
    try {
      Pkg.get();
    } catch (err) {
      done();
    }
  });

  it('Should return package with latest version.', () => {
    let pkg = Pkg.get('test');

    assert.equal(pkg, Test2);
  });

  it('Should return package with custom version.', () => {
    let pkg = Pkg.get('test#0.0.1');

    assert.equal(pkg, Test2);
  });
});
