<template>
    <div>
        <p>Login</p>
        <form @submit.prevent="login">
            <input v-model="userId" type="text" required>
            <button type="submit">Login</button>
        </form>
        <div v-if="errorMsgs.length">
            <ul>
                <li v-for="(error, index) in errorMsgs" :key="index">{{ error }}</li>
            </ul>
        </div>
    </div>
</template>

<script>

export default {
    name: 'Login',
    data() {
        return {
            userId: '',
            errorMsgs: []
        }
    },
    methods: {
        login() {
            this.errorMsgs = []
            if (this.userId.length < 4) {
                this.errorMsgs.push("Minimum 4 characters")
            } else if (this.userId.length > 8) {
                this.errorMsgs.push("Maximum 8 characters")
            } else {
                this.$store.commit('saveUserId', this.userId)
                this.$router.push('/home')
            }
        }
    },
}
</script>