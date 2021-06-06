module.exports = {
  scan: {
    dirs: ['src', 'public'],
    exclude: ['node_modules', '.git'],
    include: [],
  },
  plugins: [require('windicss/plugin/forms')],
}
