<template>
    <div>
        <p>Login</p>
        <form>
            <input v-model="userId" type="text"/>
            <button @click="login">Login</button>
        </form>
    </div>
</template>

<script>
export default {
    name: 'Login',
    methods: {
        login() {
            this.$store.commit('saveUserId', this.userId)
            this.$router.push('/home')
        }
    },
}
</script>