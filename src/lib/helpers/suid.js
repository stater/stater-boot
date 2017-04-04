import { unique } from 'shorthash';
import assert from 'assert';

export default function (pattern = uqDate()) {
  assert(typeof pattern === 'string', 'Pattern should be a string.');
  return unique(pattern).toLowerCase();
}

function uqDate() {
  return `${new Date().valueOf()}${Math.random()}`;
}
