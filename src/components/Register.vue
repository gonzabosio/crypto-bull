<template>
    <div id="container">

        <div>
            <img class="web-title" src="./icons/bullhead.png" alt="bull-icon">
            <h1 class="web-title">CryptoBull</h1>
        </div>
        
        <p id="route">Create your account</p>
        <form @submit.prevent="register">
            <label class="form-label">Username<input v-model="username" type="text" class="form-input" required></label>
            <label class="form-label">Password<input v-model="password" type="password" class="form-input" required></label>
            <button class="login-btn" type="submit">Sign Up</button>
        </form>
        <button @click="toLoginScreen" class="login-btn">I have an account</button>
        <div v-if="errorMsgs.length" class="error-msg">
            <ul>
                <li v-for="(error, index) in errorMsgs" :key="index">{{ error }}</li>
            </ul>
        </div>

    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'Register',
    data() {
        return {
            username: '',
            password: '',
            errorMsgs: [],
            API_KEY: import.meta.env.VITE_API_KEY
        }
    },
    methods: {
        register() {
            this.errorMsgs = []
            if (this.username.length < 4) {
                this.errorMsgs.push("Minimum 4 characters")
            } else if (this.username.length > 12) {
                this.errorMsgs.push("Maximum 12 characters")
            } else {
                this.errorMsgs.push('Loading...')
                this.verifyUser()
            }
        },
        verifyUser() {
            axios.post('https://crypto-users.onrender.com/register', {
                username: this.username,
                password: this.password
            }, {
                headers: {
                    'x-apikey': this.API_KEY
                }
            }).then((response) => {
                let userId = response.data.user_id
                let username = response.data.username
                this.$store.commit('saveUser', {
                    id: userId,
                    username: username
                })
                this.$router.replace('/home')
            }).catch((err) => {
                this.errorMsgs = []
                this.errorMsgs.push('Sign up failed'+ err.message)
            })
        },
        toLoginScreen() {
            this.$router.replace('/')
        }
    },
}
</script>