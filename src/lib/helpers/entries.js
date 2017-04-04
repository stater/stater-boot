export default function entries(object) {
  return Object.keys(object).map(key => [key, object[key]]);
}
