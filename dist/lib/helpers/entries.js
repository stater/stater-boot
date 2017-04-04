"use strict";

exports.__esModule = true;
exports.default = entries;
function entries(object) {
  return Object.keys(object).map(key => [key, object[key]]);
}
module.exports = exports["default"];