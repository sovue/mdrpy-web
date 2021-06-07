export default function (content) {
  const [cmd, ...opts] = content.split(' ')

  return [cmd.slice(1), opts]
}
