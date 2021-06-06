<template>
  <div id="app">
    <div class="flex justify-around p-5 gap-5">
      <textarea
        v-model="source"
        @input="parse"
        class="px-1 py-3 h-full w-full"
        :style="{ height: '500px' }"
      />
      <textarea v-model="rpy" class="px-1 py-3 w-full" readonly />
    </div>
  </div>
</template>

<script>
import MdIt from 'markdown-it'

const md = new MdIt('commonmark')

export default {
  name: 'App',
  data() {
    return {
      source: '# label_name',
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
        },
      },
    }
  },
  computed: {
    ast() {
      return md.parse(this.source)
    },
  },
  created() {
    this.parse()
  },
  methods: {
    parse() {
      const ast = this.ast
      let line = 0

      this.rpy = ''
      this.indentLevel = 0

      for (line; line < ast.length; line += 1) {
        const { type } = ast[line]
        let content = ast[line].content.trim()

        switch (type) {
          case 'heading_open': {
            this.rpy += `label ${ast[++line].content}:`

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

            this.rpy += `"${ast[(line += 2)].content}":\n`

            this.indentLevel += 1

            break
          }

          case 'inline': {
            this.rpy += this.indent()

            const [id, text] = content.split(' - ')
            this.rpy += `${
              text
                ? `${
                    Object.keys(this.options.characters).find(
                      (item) =>
                        this.options.characters[item] === id.toLowerCase()
                    ) || id
                  } "${text}"`
                : `"${id}"`
            }`

            this.rpy += '\n'

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
