class Bar {
  service(context) {
    context.logs.info('Bar in context.');
    throw new Error('Error test');
  }
}

module.exports = Bar;
