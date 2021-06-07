import CyrillicToTranslit from 'cyrillic-to-translit-js'

import trimWords from './utils/trimWords'
import indent from './utils/indent'

const translit = new CyrillicToTranslit({
  preset: 'ru',
})

export default function (ast, options) {
  let line = 0

  let indentLevel = 0
  let rpy = ''

  for (line; line < ast.length; line += 1) {
    let { type, content: rawContent } = ast[line]
    rawContent = trimWords(rawContent)

    if (rawContent.startsWith(options.syntax.ignore)) {
      rpy += indent(indentLevel)

      rpy += `${rawContent.replace(options.syntax.ignore, '').trim()}\n`

      continue
    }

    let [content, ...inlineComment] = rawContent.split('#')
    inlineComment = inlineComment.join('#') // Only first occurence is a comment

    switch (type) {
      case 'heading_open': {
        rpy += `${line === 0 ? '' : '\n'}label ${translit.transform(
          ast[++line].content,
          '_'
        )}:`

        rpy += '\n'

        indentLevel += 1

        break
      }

      case 'bullet_list_open': {
        rpy += indent(indentLevel)

        rpy += 'menu:\n'

        indentLevel += 1

        break
      }

      case 'list_item_open': {
        rpy += indent(indentLevel)

        let [choiceContent, ...inlineComment] =
          ast[(line += 2)].content.split('#')
        inlineComment = inlineComment.join('#')
        // Trimming words and handling inline comments
        // here since we're getting the content only
        // here, skipping it in the loop (line += 2)
        rpy += `"${choiceContent.trim()}":${
          inlineComment ? ` # ${inlineComment.trim()}` : ''
        }\n`

        indentLevel += 1

        break
      }

      case 'inline': {
        rpy += indent(indentLevel)

        if (content.startsWith(options.syntax.commands.trigger)) {
          const cmd = content.slice(1)

          switch (cmd) {
            case 'nvl': {
              rpy += '$ set_mode_nvl()'

              break
            }
            case 'nvlc': {
              rpy += `nvl clear`

              break
            }
            case 'adv': {
              rpy += '$ set_mode_adv()'

              break
            }
          }
        } else {
          let [id, ...text] = content.split(' ')
          text = text.join(' ').trim() // Limit occurence to only first ' - '

          const charKeys = Object.keys(options.characters)

          // If might have character id and text
          if (text) {
            id = id.toLowerCase()

            // If has known character id
            // return ${id} "${text}"
            if (
              charKeys.concat(Object.values(options.characters)).includes(id)
            ) {
              const foundId =
                charKeys.find((item) => options.characters[item] === id) || id

              rpy += `${foundId} "${text}"`
            }
            // If doesn't have known charater id
            // return full content
            else {
              rpy += `"${content}"`
            }
          } else {
            rpy += `"${content}"`
          }
        }

        rpy += `${inlineComment ? ` # ${inlineComment.trim()}` : ''}\n`

        break
      }

      case 'list_item_close': {
        indentLevel -= 1

        break
      }

      case 'bullet_list_close': {
        indentLevel -= 1

        break
      }

      case 'html_block': {
        rpy += indent(indentLevel)

        rpy += content.replace('<!--', '#').replace('-->', '').trim()

        rpy += '\n'

        break
      }
    }
  }

  return rpy
}