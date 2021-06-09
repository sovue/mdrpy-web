import Vue from 'vue'
import App from './App.vue'

import 'windi.css'
import 'prismjs'
import 'prismjs/themes/prism.css'
import 'prismjs/components/prism-renpy'

import './scss/main.scss'

Vue.config.productionTip = false

new Vue({
  render: (h) => h(App),
}).$mount('#app')
