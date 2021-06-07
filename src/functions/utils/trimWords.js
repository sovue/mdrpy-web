export default function (str) {
  return str
    .split(' ')
    .map((word) => word.trim())
    .filter(Boolean) // Filter empty strings
    .join(' ')
}
