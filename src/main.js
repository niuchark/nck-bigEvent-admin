import { createApp } from 'vue'
import pinia from './stores/main'
import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css'
import '@/assets/main.scss'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')
