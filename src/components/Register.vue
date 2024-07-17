<template>
    <div>
        <p>Register</p>
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
            errorMsgs: []
        }
    },
    methods: {
        async register() {
            const authorized = await this.verifyUser()
            if (!authorized) {
                return
            }
            this.errorMsgs = []
            if (this.userId.length < 4) {
                this.errorMsgs.push("Minimum 4 characters")
            } else if (this.userId.length > 8) {
                this.errorMsgs.push("Maximum 8 characters")
            } else {
                this.$store.commit('saveUserId', this.userId)
                this.$router.push('/home')
            }
        },
        async verifyUser() {
            return true
            //call db to verify if user already exists
        },
        toLoginScreen() {
            this.$router.push('/')
        }
    },
}
</script>