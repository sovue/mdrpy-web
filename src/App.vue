<template>
  <div id="app">
    <div class="absolute top-0 left-0 px-2 py-1 bg-light-500 z-10">
      <details class="text-center">
        <summary class="cursor-pointer">Options</summary>
        <div class="flex flex-col items-center justify-center">
          <div
            class="flex items-center justify-around flex-wrap py-2 px-1 gap-3"
          >
            <div class="flex items-center gap-3">
              <label>Character replies delim:</label>
              <input v-model="options.characterDelim" type="text" />
            </div>
            <div
              v-for="(opt, index) in Object.keys(options.syntax)"
              :key="index"
              class="flex items-center gap-3"
            >
              <label>{{ opt }}:</label>
              <input v-model="options.syntax[opt]" type="text" />
            </div>
          </div>
          <div>
            <label>Characters IDs overwrites:</label>
            <ul>
              <li
                v-for="(character, index) in Object.keys(options.characters)"
                :key="index"
                class="flex items-center justify-between gap-3"
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
      class="default-theme pt-30px pt-10 pb-5 px-3 h-full"
      @resize="configureEditorSize"
      :horizontal="isMobile"
    >
      <pane size="50">
        <textarea
          v-if="isMobile"
          v-model="source"
          @input="parse"
          class="w-full h-full"
        />
        <MonacoEditor
          v-else
          class="w-full h-full"
          v-model="source"
          @change="parse"
          language="markdown"
          :options="{
            theme: 'vs-dark',
            automaticLayout: true,
            lightbulb: { enabled: false },
            minimap: { enabled: false },
            quickSuggestions: false,
            renderWhitespace: 'boundary',
            renderFinalNewline: true,
            renderIndentGuides: true,
            codeLens: false,
            copyWithSyntaxHighlighting: false,
            cursorBlinking: 'smooth',
            dragAndDrop: false,
            fontFamily: 'JetBrains Mono, monospace',
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
        <prism language="renpy" :code="rpy" />
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import MdIt from 'markdown-it'
import Prism from 'vue-prism-component'
import MonacoEditor from 'vue-monaco'
import { Pane, Splitpanes } from 'splitpanes'
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
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)

    return {
      source: example,
      rpy: '',
      options: {
        characterDelim: ' - ',
        syntax: {
          ignore: '\\',
          call: '%',
          jump: '=',
        },
        characters: {
          mt: 'od',
          me: 's',
          dv: 'a',
          sl: 'sl',
          sh: 'sh',
          us: 'us',
          un: 'l',
          mi: 'm',
          mz: 'zh',
        },
      },
      isMobile,
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
