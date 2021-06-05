<template>
  <div id="app">
    <div class="w-full flex justify-around">
      <textarea v-model="source" class="w-full" @input="parse" />
      <textarea v-model="rpy" class="w-full" readonly />
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
            this.rpy += `${text ? `${id} "${text}"` : `"${id}"`}`

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
