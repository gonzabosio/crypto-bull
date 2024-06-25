import { createApp } from 'vue'
import App from './App.vue'
//Router
import { createRouter, createWebHashHistory } from 'vue-router'
// Vuex
import { createStore } from 'vuex'

import Login from './components/Login.vue'
import Home from './components/Home.vue'

const routes = [
    { path: '/', component: Login },
    { path: '/home', component: Home }
]
const router = createRouter({
    history: createWebHashHistory(),
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
            state.userId = newUser
            localStorage.setItem('store', JSON.stringify(state))
        }
    }
})
const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
