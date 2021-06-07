export default function (str) {
  let [content, ...inlineComment] = str.split('#')
  inlineComment = inlineComment.join('#') // Only first occurence is a comment

  return [content.trim(), inlineComment.trim()]
}
