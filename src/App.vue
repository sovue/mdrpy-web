<template>
  <div id="app">
    <div class="py-5 px-3 text-center">
      <details class="cursor-pointer">
        <summary>Настройки</summary>
        <div class="flex items-center justify-around flex-wrap py-2 px-1 gap-3">
          <div class="flex items-center gap-3">
            <label>Разделитель реплик персонажей:</label>
            <input v-model="options.characterDelim" type="text" />
          </div>
          <div class="flex items-center gap-3">
            <label>Знак игнорирования строки:</label>
            <input v-model="options.syntax.ignore" type="text" />
          </div>
          <div>
            <label>Замена ID персонажей:</label>
            <ul>
              <li
                v-for="(character, index) in Object.keys(options.characters)"
                :key="index"
                class="flex items-center justify-between gap-1"
              >
                <label>{{ character }}:</label>
                <input v-model="options.characters[character]" type="text" />
              </li>
            </ul>
          </div>
        </div>
      </details>
    </div>
    <splitpanes
      class="default-theme py-5 px-3 h-80vh"
      @resize="configureEditorSize"
    >
      <pane min-size="50" size="50">
        <MonacoEditor
          ref="editor"
          class="w-full h-full"
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
      </pane>
      <pane size="50" class="overflow-y-auto">
        <prism language="renpy">
          {{ rpy }}
        </prism>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import MdIt from 'markdown-it'
import Prism from 'vue-prism-component'
import MonacoEditor from 'vue-monaco'
import { Splitpanes, Pane } from 'splitpanes'
// import { useStorage } from '@vueuse/core'

import parse from './functions/parse'

import 'splitpanes/dist/splitpanes.css'

import example from './assets/md/example.md'

const md = new MdIt('commonmark')

export default {
  name: 'App',
  components: {
    Prism,
    MonacoEditor,
    Splitpanes,
    Pane,
  },
  data() {
    return {
      source: example,
      rpy: '',
      options: {
        characterDelim: ' - ',
        syntax: {
          ignore: '\\',
        },
        characters: {
          mt: 'од',
          me: 'с',
          dv: 'а',
          sl: 'сл',
          sh: 'ш',
          us: 'у',
          un: 'л',
          mi: 'м',
          mz: 'ж',
        },
      },
    }
  },
  watch: {
    options: {
      deep: true,
      handler() {
        this.parse()
      },
    },
  },
  computed: {
    ast() {
      return md.parse(this.source, { references: {} })
    },
  },
  async created() {
    // this.options = useStorage('options', this.options).value
    this.parse()
  },
  methods: {
    configureEditorSize() {
      // Since Monaco editor listens to resize
      // event, fire them manually when needed
      window.dispatchEvent(new Event('resize'))
    },
    parse() {
      this.rpy = parse(this.ast, this.options)
    },
  },
}
</script>

<style lang="scss">
code,
pre {
  &[class*='language-'] {
    white-space: pre-wrap !important;
  }
}
</style>
