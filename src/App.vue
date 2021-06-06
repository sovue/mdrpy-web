<template>
  <div id="app">
    <div class="flex-col align-center p-5 gap-5">
      <MonacoEditor
        class="w-full min-h-500px"
        v-model="source"
        @change="parse"
        language="markdown"
        :options="{
          theme: 'vs-dark',
          automaticLayout: true,
          lightbulb: { enabled: false },
          minimap: { enabled: false },
          renderWhitespace: 'boundary',
          renderFinalNewline: true,
          renderIndentGuides: true,
          codeLens: false,
          copyWithSyntaxHighlighting: false,
          cursorBlinking: 'smooth',
          dragAndDrop: false,
          fontFamily: 'JetBrains Mono',
          fontSize: 16,
          fontWeight: 300,
          letterSpacing: 1.5,
          lineHeight: 30,
          tabSize: 2,
          inDiffEditor: false,
          wordWrap: 'on',
        }"
      />
      <prism language="renpy" class="max-h-400px">
        {{ rpy }}
      </prism>
    </div>
  </div>
</template>

<script>
import MdIt from 'markdown-it'
import Prism from 'vue-prism-component'
import CyrillicToTranslit from 'cyrillic-to-translit-js'
import MonacoEditor from 'vue-monaco'

const md = new MdIt('commonmark')
const translit = new CyrillicToTranslit({
  preset: 'ru',
})

function trimWords(str) {
  return str
    .split(' ')
    .map((word) => word.trim())
    .filter(Boolean) // Filter empty strings
    .join(' ')
}

export default {
  name: 'App',
  components: {
    Prism,
    MonacoEditor,
  },
  data() {
    return {
      source:
        '# День 1\n\n  а Привет\n\n  - Привет\n\n    с Привет\n\n  - Привет, Алиса\n\n    с Привет, Алиса\n\n  $nvl\n\n  NVL mode active\n\n  $nvlc\n\n  Cleared nvl content\n\n  $adv\n\n  ADV mode active',
      rpy: '',
      indentLevel: 0,
      options: {
        characters: {
          mt: 'од',
          me: 'с',
          dv: 'а',
          sl: 'сл',
          sh: 'ш',
          us: 'у',
          un: 'л',
        },
      },
    }
  },
  computed: {
    ast() {
      return md.parse(this.source, { references: {} })
    },
  },
  async created() {
    this.parse()
  },
  methods: {
    parse() {
      const ast = this.ast
      let line = 0

      this.rpy = ''
      this.indentLevel = 0

      for (line; line < ast.length; line += 1) {
        const { type, content: rawContent } = ast[line]

        let [content, ...inlineComment] = trimWords(rawContent).split('#')
        inlineComment = inlineComment.join('#') // Only first occurence is a comment

        switch (type) {
          case 'heading_open': {
            this.rpy += `${line === 0 ? '' : '\n'}label ${translit.transform(
              ast[++line].content,
              '_'
            )}:`

            this.rpy += '\n'

            this.indentLevel += 1

            break
          }

          case 'bullet_list_open': {
            this.rpy += this.indent()

            this.rpy += 'menu:\n'

            this.indentLevel += 1

            break
          }

          case 'list_item_open': {
            this.rpy += this.indent()

            let [choiceContent, ...inlineComment] =
              ast[(line += 2)].content.split('#')
            inlineComment = inlineComment.join('#')
            // Trimming words and handling inline comments
            // here since we're getting the content only
            // here, skipping it in the loop (line += 2)
            this.rpy += `"${choiceContent.trim()}":${
              inlineComment ? ` # ${inlineComment.trim()}` : ''
            }\n`

            this.indentLevel += 1

            break
          }

          case 'inline': {
            this.rpy += this.indent()

            if (content.startsWith('$')) {
              const cmd = content.slice(1)

              switch (cmd) {
                case 'nvl': {
                  this.rpy += '$ set_mode_nvl()'

                  break
                }
                case 'nvlc': {
                  this.rpy += `nvl clear`

                  break
                }
                case 'adv': {
                  this.rpy += '$ set_mode_adv()'

                  break
                }
              }
            } else {
              let [id, ...text] = content.split(' ')
              text = text.join(' ').trim() // Limit occurence to only first ' - '

              const charKeys = Object.keys(this.options.characters)

              // If might have character id and text
              if (text) {
                id = id.toLowerCase()

                // If has known character id
                // return ${id} "${text}"
                if (
                  charKeys
                    .concat(Object.values(this.options.characters))
                    .includes(id)
                ) {
                  const foundId =
                    charKeys.find(
                      (item) => this.options.characters[item] === id
                    ) || id

                  this.rpy += `${foundId} "${text}"`
                }
                // If doesn't have known charater id
                // return full content
                else {
                  this.rpy += `"${content}"`
                }
              } else {
                this.rpy += `"${content}"`
              }
            }

            this.rpy += `${inlineComment ? ` # ${inlineComment}` : ''}\n`

            break
          }

          case 'list_item_close': {
            this.indentLevel -= 1

            break
          }

          case 'bullet_list_close': {
            this.indentLevel -= 1

            break
          }

          case 'html_block': {
            this.rpy += this.indent()

            this.rpy += content.replace('<!--', '#').replace('-->', '').trim()

            this.rpy += '\n'

            break
          }
        }
      }
    },
    indent() {
      return Array(this.indentLevel * 4)
        .fill(' ')
        .join('')
    },
  },
}
</script>

<style lang="scss">
code[class*='language-'],
pre[class*='language-'] {
  white-space: pre-wrap;
}
</style>
