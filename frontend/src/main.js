import { createApp } from 'vue'
import App from './App.vue'
import router from "./router/index.js";

// Importing stylesheets.
import './assets/stylesheet/style.scss'
import './assets/stylesheet/navbar_style.scss'
import './assets/stylesheet/transitions.scss'
import './assets/stylesheet/forms_style.scss'


createApp(App)
    .use(router)
    .mount('#app')
