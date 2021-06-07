const MonacoEditorPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  plugins: [
    new MonacoEditorPlugin({
      // https://github.com/Microsoft/monaco-editor-webpack-plugin#options
      // Include a subset of languages support
      // Some language extensions like typescript are so huge that may impact build performance
      // e.g. Build full languages support with webpack 4.0 takes over 80 seconds
      // Languages are loaded on demand at runtime
      languages: ['markdown'],
      features: [
        'anchorSelect',
        'bracketMatching',
        'caretOperations',
        'clipboard',
        'codeAction',
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
        'suggest',
        'toggleTabFocusMode',
        'transpose',
        'unusualLineTerminators',
        'viewportSemanticTokens',
        'wordHighlighter',
        'wordOperations',
        'wordPartOperations',
      ],
      publicPath: '/',
    }),
  ],
}
