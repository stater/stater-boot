class Foo {
  service(context) {
    context.logs.info('Foo in context.');
  }
}

module.exports = Foo;
