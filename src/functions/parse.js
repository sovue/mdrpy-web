import CyrillicToTranslit from 'cyrillic-to-translit-js'

import trimWords from './utils/trimWords'
import indent from './utils/indent'
import exInlineComments from './utils/extractInlineComments'
import getCmd from './utils/getCmd'

const translit = new CyrillicToTranslit({
  preset: 'ru',
})

export default function (ast, options) {
  let line = 0

  let indentLevel = 0
  let rpy = ''

  for (line; line < ast.length; line += 1) {
    let { type, children, content: rawContent } = ast[line]

    if (type === 'fence') {
      // For the fence type we don't
      // need any general transformations
      // since it contains pure code
      rpy += indent(indentLevel)

      rpy += 'python:\n'

      rpy +=
        rawContent
          .trim()
          .split('\n')
          .map((codeLine) => `${indent(indentLevel + 1)}${codeLine}`)
          .join('\n') + '\n'

      continue
    }

    rawContent = trimWords(rawContent)

    if (rawContent.startsWith(options.syntax.ignore)) {
      rpy += indent(indentLevel)

      rpy += `${rawContent.replace(options.syntax.ignore, '').trim()}\n`

      continue
    }

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
              content = content.replace(
                new RegExp(`${options.quotes}`, 'g'),
                `\\${options.quotes}`
              )

              if (content.startsWith(options.syntax.commands.trigger)) {
                const [cmd, cmdOptions] = getCmd(content)

                switch (cmd) {
                  case options.syntax.commands.nvl: {
                    rpy += '$ set_mode_nvl()'

                    break
                  }
                  case options.syntax.commands.nvlClear: {
                    rpy += `nvl clear`

                    break
                  }
                  case options.syntax.commands.adv: {
                    rpy += '$ set_mode_adv()'

                    break
                  }
                  case options.syntax.commands.time: {
                    const [time] = cmdOptions

                    if (['prolog', 'day', 'sunset', 'night'].includes(time)) {
                      rpy += `$ ${time}_time()`
                    }

                    break
                  }
                  case options.syntax.commands.backdropMonitor: {
                    const [monitor] = cmdOptions

                    if (['un', 'us', 'sl', 'dv', undefined].includes(monitor)) {
                      rpy += `$ backdrop = ${options.quotes}${
                        monitor || 'days'
                      }${options.quotes}`
                    } else {
                      continue
                    }

                    break
                  }
                }
              } else {
                let [id, ...text] = content.split(options.characterDelim)
                text = text.join(options.characterDelim).trim() // Limit occurence to only first ' - '

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
                      charKeys.find(
                        (item) => options.characters[item] === id
                      ) || id

                    rpy += `${foundId} ${options.quotes}${text}${options.quotes}`
                  }
                  // If doesn't have known charater id
                  // return full content
                  else {
                    rpy += `${options.quotes}${content}${options.quotes}`
                  }
                } else {
                  rpy += `${options.quotes}${content}${options.quotes}`
                }
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

          // Since we're skipping the loop
          // we need to handle inline comments
          // here
          let [choiceContent, inlineComment] = exInlineComments(
            ast[(line += 2)].content
          )
          rpy += `${options.quotes}${choiceContent}${options.quotes}:${
            inlineComment ? ` # ${inlineComment}` : ''
          }\n`

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
