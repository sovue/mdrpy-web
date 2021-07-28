import CyrillicToTranslit from 'cyrillic-to-translit-js'

import trimWords from './utils/trimWords'
import indent from './utils/indent'
import exInlineComments from './utils/extractInlineComments'

const translit = new CyrillicToTranslit({
  preset: 'ru',
})

export default function (ast, options) {
  let line = 0

  let indentLevel = 0
  let rpy = ''

  for (line; line < ast.length; line += 1) {
    let { type, children, content: rawContent } = ast[line]

    // Should always be on top
    if (rawContent.startsWith(options.syntax.ignore)) {
      rpy += indent(indentLevel)

      rpy += `${rawContent.replace(options.syntax.ignore, '').trim()}\n`

      continue
    }

    if (type === 'fence') {
      // For the fence type we don't
      // need any general transformations
      // since it contains pure code
      rpy += indent(indentLevel)

      rpy +=
        rawContent
          .trim()
          .split('\n')
          .map((codeLine) => `${indent(indentLevel)}${codeLine}`)
          .join('\n') + '\n'

      continue
    }

    rawContent = trimWords(rawContent)

    let [content, inlineComment] = exInlineComments(rawContent)

    if (type === 'inline') {
      if (children.length) {
        for (const child of children) {
          // Redo everything for child content
          // since it is different from `content`
          ;[content, inlineComment] = exInlineComments(child.content)

          content = content.trim()

          rpy += indent(indentLevel)

          switch (child.type) {
            case 'text': {
              // Handle jumps on top because
              // they don't need any transforms
              if (content.startsWith(options.syntax.call)) {
                rpy += `call ${content
                  .slice(options.syntax.call.length)
                  .trim()}`

                break
              } else if (content.startsWith(options.syntax.jump)) {
                rpy += `jump ${content
                  .slice(options.syntax.jump.length)
                  .trim()}`

                break
              }

              content = content.replace(new RegExp('"', 'g'), '\\"')

              let [id, ...text] = content.split(options.characterDelim)
              text = text.join(options.characterDelim).trim() // Limit occurrence to only first delim

              const charKeys = Object.keys(options.characters)

              // If might have character id and text
              if (text) {
                id = id.toLowerCase()

                // If has known character id
                // return ${id} "${text}"
                if (
                  charKeys
                    .concat(Object.values(options.characters))
                    .includes(id)
                ) {
                  const foundId =
                    charKeys.find((item) => options.characters[item] === id) ||
                    id

                  rpy += `${foundId} "${text}"`
                }
                // If doesn't have known character id
                // return full content
                else {
                  rpy += `"${content}"`
                }
              } else {
                rpy += `"${content}"`
              }

              break
            }

            case 'code_inline': {
              // Use child's content since
              // it doesn't include '``'
              rpy += `$ ${content}`

              break
            }
          }

          rpy += `${inlineComment ? ` # ${inlineComment}` : ''}\n`
        }
      }
    } else {
      switch (type) {
        case 'heading_open': {
          rpy += `${line === 0 ? '' : '\n'}label ${translit.transform(
            ast[++line].content,
            '_'
          )}:`

          rpy += '\n'

          indentLevel = 1

          break
        }

        case 'bullet_list_open': {
          if (!ast[line + 3].content.startsWith('?')) {
            rpy += indent(indentLevel)

            rpy += 'menu:\n'

            indentLevel += 1
          }

          break
        }

        case 'list_item_open': {
          rpy += indent(indentLevel)

          // Since we're skipping the loop
          // we need to handle inline comments
          // here
          let [choiceContent, inlineComment] = exInlineComments(
            ast[(line += 2)].content
          )
          choiceContent = choiceContent.trim()
          // Extract conditional choice character
          if (choiceContent.startsWith('???')) {
            rpy += `else:`
          } else if (choiceContent.startsWith('??')) {
            rpy += `elif ${choiceContent.slice(2).trim()}:`
          } else if (choiceContent.startsWith('?')) {
            rpy += `if ${choiceContent.slice(1).trim()}:`
          } else {
            const conditionalChoiceSplit = choiceContent.split('|')
            let conditionalChoice = ''
            if (conditionalChoiceSplit.length > 1) {
              conditionalChoice = ` if ${conditionalChoiceSplit.pop().trim()}`
              choiceContent = conditionalChoiceSplit.join('|').trim()
            }

            rpy += `"${choiceContent}"${conditionalChoice}:`
          }

          rpy += `${inlineComment ? ` # ${inlineComment}` : ''}\n`

          indentLevel += 1

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
  }

  return rpy
}
