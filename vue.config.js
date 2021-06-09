const MonacoEditorPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.md$/i,
          loader: 'raw-loader',
        },
      ],
    },
    plugins: [
      new MonacoEditorPlugin({
        // https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        // Include a subset of languages support
        // Some language extensions like typescript are so huge that may impact build performance
        // e.g. Build full languages support with webpack 4.0 takes over 80 seconds
        // Languages are loaded on demand at runtime
        languages: ['markdown'],
        features: [
          'accessibilityHelp',
          'anchorSelect',
          'bracketMatching',
          'caretOperations',
          'clipboard',
          'codeAction',
          'codelens',
          'colorPicker',
          'comment',
          'contextmenu',
          'coreCommands',
          'cursorUndo',
          'dnd',
          'documentSymbols',
          'find',
          'folding',
          'fontZoom',
          'format',
          'gotoError',
          'gotoLine',
          'gotoSymbol',
          'hover',
          'iPadShowKeyboard',
          'inPlaceReplace',
          'indentation',
          'inlineHints',
          'inspectTokens',
          'linesOperations',
          'linkedEditing',
          'links',
          'multicursor',
          'parameterHints',
          'quickCommand',
          'quickHelp',
          'quickOutline',
          'referenceSearch',
          'rename',
          'smartSelect',
          'snippets',
          'toggleHighContrast',
          'toggleTabFocusMode',
          'transpose',
          'unusualLineTerminators',
          'viewportSemanticTokens',
          'wordHighlighter',
          'wordOperations',
          'wordPartOperations',
        ],
      }),
    ],
  },
}
