<template>
    <div id="container">
        <div>
            <img class="web-title" src="./icons/bullhead.png" alt="bull-icon">
            <h1 class="web-title">CryptoBull</h1>
        </div>

        <p id="route">Sign in</p>
        <form @submit.prevent="login">
            <label class="form-label">Username<input class="form-input" v-model="username" type="text" required/></label>
            <label class="form-label">Password<input class="form-input" v-model="password" type="password" required></label>
            <button class="login-btn" type="submit">Login</button>
        </form>
        <button class="login-btn" @click="toRegisterScreen">
            <span>Create an account</span></button>
        <div v-if="msg.length">
            <ul>
                <li v-for="(error, index) in msg" :key="index" class="error-msg">{{ error }}</li>
            </ul>
        </div>

    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'Login',
    data() {
        return {
            username: '',
            password: '',
            msg: [],
            API_KEY: import.meta.env.VITE_API_KEY
        }
    },
    methods: {
        login() {
            this.msg = []
            if (this.username.length < 4) {
                this.msg.push("Minimum 4 characters (Username)")
            } else if (this.username.length > 12) {
                this.msg.push("Maximum 12 characters (Username)")
            } else {
                this.msg.push('Loading...')
                this.verifyUser()
            }
        },
        verifyUser() {
            axios.post('https://crypto-users.onrender.com/login', {
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
                this.msg = []
                if (err.response.status == '404') {
                    this.msg.push('User not found')
                } else {
                    this.msg.push('User verification failed - '+'Error: '+err.response.status)
                }
                
            })
        },
        toRegisterScreen() {
            this.$router.push('/register')
        }
    },
}
</script>

<style>
    body {
        margin: 0;
    }
    #container {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        height: 100vh;
    }
    #route {
        font-size: 25px;
    }
    .form-label {
        display: flex;
        flex-direction: column;
        margin-left: 20px;
        margin-right: 20px;
        margin-bottom: 20px;
    }
    .form-input {
        display: block;
        height: 25px;
        font-size: 16px;
    }
    .web-title {
        display: inline-block;
    }.web-title + h1 {
        font-size: 50px;
    }
    .form-label [type="password"] {
        margin-bottom: 40px;
    }
    .login-btn {
        background-color: rgb(32, 32, 32);
        color: whitesmoke;
        text-decoration: none;
        letter-spacing: 0.1rem;
        font-size: 20px;
        padding: 10px 30px; 
        transition: 0.5s;
        border: 1px solid whitesmoke;
        border-radius: 8px;
        width: 295px;
        height: 50px;
        margin-bottom: 30px;
    }
    .login-btn:hover {
        cursor: pointer;
        background-color: rgb(38, 38, 38);
        color: whitesmoke;
        letter-spacing: 0.25rem;
        box-shadow: 0 0 10px #fff;
    }
</style>