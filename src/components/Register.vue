<template>
    <div>
        <p>Create your account</p>
        <form @submit.prevent="register">
            <input v-model="userId" type="text" required><br>
            <input v-model="password" type="text" required><br>
            <button type="submit">Sign up</button>
        </form>
        <button @click="toLoginScreen">I have an account</button>
        <div v-if="errorMsgs.length">
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
            userId: '',
            password: '',
            errorMsgs: [],
            API_KEY: import.meta.env.VITE_API_KEY
        }
    },
    methods: {
        register() {
            this.errorMsgs = []
            if (this.userId.length < 4) {
                this.errorMsgs.push("Minimum 4 characters")
            } else if (this.userId.length > 12) {
                this.errorMsgs.push("Maximum 12 characters")
            } else {
                this.verifyUser()
            }
        },
        verifyUser() {
            axios.post('https://crypto-users.onrender.com/register', {
                username: this.userId,
                password: this.password
            }, {
                headers: {
                    'Content-Type': 'application/json',
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
            }).catch(function(err) {
                this.errorMsgs.push('Sign up failed'+err.message)
            })
        },
        toLoginScreen() {
            this.$router.replace('/')
        }
    },
}
</script>