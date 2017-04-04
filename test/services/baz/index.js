class Baz {
  service(context) {
    context.logs.info('Baz in context.');
  }
}

module.exports = Baz;
