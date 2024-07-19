import { createApp } from 'vue'
import App from './App.vue'
//Router
import { createRouter, createWebHistory } from 'vue-router'
// Vuex
import { createStore } from 'vuex'

import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Home from './components/Home.vue'
import Transactions from './components/Transactions.vue'

const routes = [
    { path: '/', component: Login },
    { path: '/register', component: Register },
    { path: '/home', component: Home },
    { path: '/transactions', component: Transactions }
]
const router = createRouter({
    history: createWebHistory(),
    routes
})

const store = createStore({
    state() {
        return {
            user: JSON.parse(localStorage.getItem('user')) || {
                id: null,
                username: null
            }
        }
    },
    mutations: {
        saveUser: (state, userData) => {
            state.user.id = userData.id
            state.user.username = userData.username
            localStorage.setItem('user', JSON.stringify(state.user))
        }
    }
})
const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
