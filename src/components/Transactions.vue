<template>
    <h2>History</h2>
    <div v-if="err != ''">{{ err }}</div>
    <table v-else>
        <thead>
            <tr>
                <th>Action</th>
                <th>Code</th>
                <th>Amount</th>
                <th>Money</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(transaction) in transactions">
                <td>{{ transaction.action }}</td>
                <td>{{ transaction.crypto_code }}</td>
                <td>{{ transaction.crypto_amount }}</td>
                <td>{{ transaction.money }}</td>
            </tr>
        </tbody>
    </table>
</template>
<script>
import axios from 'axios';

export default {
    name: 'Transactions',
    data() {
        return {
            transactions: {},
            err: '',
            API_KEY: import.meta.env.VITE_API_KEY
        }
    },
    created() {
        this.getTransactions()
    },
    methods: {
        getTransactions() {
            axios.get(`https://crypto-users.onrender.com/actions/${this.$store.state.user.id}`, {              
                headers: {'x-apikey': this.API_KEY}       
            }).then((response) => {
                if (response.data == null) {
                    this.err = 'You have no activity'
                } else {
                    this.transactions = response.data
                }
                
            }).catch((error) => {
                this.err = error
            })
        }
    }
}
</script>