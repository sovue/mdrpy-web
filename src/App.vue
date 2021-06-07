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
import MonacoEditor from 'vue-monaco'

import parse from './functions/parse'

const md = new MdIt('commonmark')

export default {
  name: 'App',
  components: {
    Prism,
    MonacoEditor,
  },
  data() {
    return {
      source: `# День 1\n\n  а Привет\n\n  - Привет\n\n    с Привет\n\n  - Привет, Алиса\n\n    с Привет, Алиса\n\n  !nvl\n\n  NVL mode active\n\n  !nvlc\n\n  Cleared nvl content\n\n  !adv\n\n  ADV mode active\n\n  \\ "Эта строка НЕ будет обрабатываться и пойдёт в код как есть"\n\n  \\ $ print('Python') # Полезно при использовании собственных функций\n\n  <!-- В случае со строчным кодом, строчный комментарий должен находится в элементе строчного кода как показано ниже -->\n\n  \`set_mode_nvl # Также можно использовать строчный код\``,
      rpy: '',
      indentLevel: 0,
      options: {
        syntax: {
          ignore: '\\',
          commands: {
            trigger: '!',
          },
        },
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
      this.rpy = parse(this.ast, this.options)
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
code,
pre {
  &[class*='language-'] {
    white-space: pre-wrap;
  }
}
</style>
