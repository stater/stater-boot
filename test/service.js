// Creating service, and this service has configs.
// The service name will be "foo" since the loader will using the constructor name.
class foo {
  service(ctx) {
    ctx.logs.info('Foo showing log!');
  }
}

foo.configs = { host: '127.0.0.1', port: 8080 };

// Creating service with custom version and add required services.
class bar {
  constructor() {
    this.beforeRun = ['foo'];
  }

  service(ctx) {
    ctx.logs.info('Bar showing log!');

    // Add some info to the context.
    ctx.logs.info('Mark the server as ready to listen...');
    ctx.set('ready', true);
  }
}

bar.version = '1.0.0';
bar.require = ['foo'];

// Creating bootstrap service (exported class/function).
// The service name will be the same with in the package.json.
// The the package version will be picked from the package.json.
class Service {
  constructor() {
    this.beforeRun = ['bar'];
  }

  service(ctx, cfg) {
    // Get the config from foo.
    let foo = cfg.get('foo');

    if (ctx.get('ready')) {
      ctx.logs.info('Server is ready!');
      ctx.logs.info(`Server is running on https://${foo.host}:${foo.port}.`);
    }

    // The test should be error in here.
    ctx.boom();
  }
}

Object.assign(Service, {
  require: ['stater-foo'],
  include: [bar, foo]
});

module.exports = Service;