import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './main.css'
import App from './app.vue'
import router from './router'
const app = createApp(App)
const pinia = createPinia()
app.use(router)
app.use(pinia)
app.mount('#root')
