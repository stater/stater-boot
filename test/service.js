// Creating service, and this service has configs.
// The service name will be "foo" since the loader will using the constructor name.
class foo {
  service(ctx) {
    ctx.logs.info('Foo showing log!');
    ctx.logs.info(ctx.get('a') || 'null');
  }
}

foo.configs = {
  host: '127.0.0.1', port: 8080, reconfigure(c, s) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('OK');
      }, 3000);
    });
  }
};

// Creating service with custom version and add required services.
class bar {
  constructor() {
    this.beforeRun = ['foo'];
  }

  service(ctx) {
    ctx.logs.info('Bar showing log!');

    // Add some info to the context.
    ctx.logs.info('Starting server...');

    return new Promise(resolve => {
      setTimeout(() => {
        ctx.logs.info('Mark the server as ready to listen...');
        ctx.set('ready', true);
        resolve('Success');
      }, 3000);
    });
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

  async service(ctx, cfg) {
    // Get the config from foo.
    let foo = cfg.get('foo');

    if (ctx.get('ready')) {
      ctx.logs.info('Server is ready!');
      ctx.logs.info(`Server is running on https://${foo.host}:${foo.port}.`);
    }

    await ctx.start(['foo', 'foo'], { a: '1', b: '2' });

    // The test should be error in here.
    ctx.boom();
  }
}

Object.assign(Service, {
  require: ['stater-foo'],
  include: [bar, foo]
});

module.exports = Service;
