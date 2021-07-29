export default function (str) {
  return str.startsWith('"') ? str : `"${str}"`
}
