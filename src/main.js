import { createApp } from 'vue'
import App from './App.vue'
//Router
import { createRouter, createWebHistory } from 'vue-router'
// Vuex
import { createStore } from 'vuex'
//UUID
import { v4 as uuidv4 } from 'uuid';

import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Home from './components/Home.vue'

const routes = [
    { path: '/', component: Login },
    { path: '/register', component: Register },
    { path: '/home', component: Home }
]
const router = createRouter({
    history: createWebHistory(),
    routes
})

const localData = localStorage.getItem('store')
    ? JSON.parse(localStorage.getItem('store'))
    : { userId: '' }
const store = createStore({
    state() {
        return localData
    },
    mutations: {
        saveUserId(state, newUser) {
            let genUUID = uuidv4();
            state.userId = newUser + '-' + genUUID
            localStorage.setItem('store', JSON.stringify(state))
        }
    }
})
const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
