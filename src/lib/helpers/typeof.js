export default function typeOf(object) {
  return raw(object).replace(/(\[object\s)|(\])/g, '').toLocaleLowerCase();
}

export function raw(object) {
  if ('undefined' === typeof object) {
    return '[object Undefined]';
  } else if (object === null) {
    return '[object Null]';
  } else {
    if (object.prototype) {
      if (typeof object === 'function') {
        return object.prototype.__interface__ || '[object Constructor]';
      } else {
        return toString.call(object);
      }
    } else {
      return object.__interface__ || toString.call(object);
    }
  }
}

export function add(name, object) {
  if ('string' === typeof name && 'undefined' !== typeof object) {
    Object.defineProperty(object.prototype, '__interface__', {
      enumerable: false,
      writable: false,
      value: `[object ${name}]`
    });
  }
}
