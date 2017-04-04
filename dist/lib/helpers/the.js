'use strict';

exports.__esModule = true;
exports.the = the;
exports.typeOf = typeOf;
let The = class The {
  constructor(object) {
    this.type = typeOf(object);
    this.object = object;
  }

  // METHODS.
  is(types) {
    // Use single check if the types is string.
    if (typeof types === 'string') {
      return this.type === types;
    }

    // Use multiple check if the types is array.
    else if (Array.isArray(types)) {
        // Set the correct to false.
        let correct = false;

        // Iterate the types to check the object type.
        for (let type of types) {
          if (this.type === type) {
            correct = true;
          }
        }

        // Return the correct.
        return correct;
      }
  }

  not(type) {
    // Use negation of .is().
    return this.is(type) === false;
  }

  like(target) {
    // Check does this type is equal to the target type.
    return this.type === typeOf(target);
  }

  unlike(target) {
    // Use negation of .like().
    return this.like(target) === false;
  }

  eq(data) {
    if (typeof data === 'string' || typeof data === 'number') {
      return this.like(data) && this.object === data;
    } else if (Array.isArray(data)) {
      let correct = false;

      for (let dt of data) {
        if (this.like(dt) && this.object === dt) {
          correct = true;
        }
      }

      return correct;
    }
  }

  ineq(data) {
    return this.eq(data) === false;
  }
};
function the(object) {
  return new The(object);
}

function typeOf(object) {
  return toString.call(object).replace(/(\[object\s+)|(\])/g, '').toLowerCase();
}