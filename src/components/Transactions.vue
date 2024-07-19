<template>
    <h2>History</h2>
    <div v-if="err != ''">{{ err }}</div>
    <table v-else-if="!showEditForm">
        <thead>
            <tr>
                <th>Action</th>
                <th>Crypto</th>
                <th>Currency</th>
                <th>Amount</th>
                <th>Money</th>
                <th>Datetime</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(transaction) in transactions">
                <td>{{ transaction.action }}</td>
                <td>{{ transaction.crypto_code }}</td>
                <td>{{ transaction.currency }}</td>
                <td>{{ transaction.crypto_amount }}</td>
                <td>{{ transaction.money }}</td>
                <td>{{ transaction.performed_at }}</td>
                <button @click="showForm(transaction.activity_id)">Edit</button>
                <button @click="deleteAction(transaction.activity_id)">Delete</button>
            </tr>
        </tbody>
    </table>
    <div v-else-if="showEditForm">
        <form @submit.prevent="saveEdit">
            <label>Action<input type="text" v-model="form.action"/></label><br>
            <label>Crypto<input type="text" v-model="form.crypto"></label><br>
            <label>Currency<input type="text" v-model="form.currency"></label><br>
            <label>Amount<input type="text" v-model="form.amount"></label><br>
            <label>Money<input type="text" v-model="form.money"></label><br>
            <button type="button" @click="cancelEdit">Cancel</button>
            <button type="submit">Save</button>
        </form>
    </div>
</template>
<script>
import axios from 'axios';

export default {
    name: 'Transactions',
    data() {
        return {
            transactions: {},
            err: '',
            showEditForm: false,
            actionId: '',
            form: {
                action: null,
                crypto: null,
                currency: null,
                amount: null,
                money: null
            },
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
        },
        showForm(actionID) {
            this.actionId = actionID
            this.showEditForm = true
        },
        saveEdit() {
            if (this.form.currency == "") {
                this.form.currency = null
            }
            axios.patch(`https://crypto-users.onrender.com/actions/${this.actionId}`, {
                action: this.form.action,
                crypto_code: this.form.crypto,
                currency: this.form.currency,
                crypto_amount: parseFloat(this.form.amount),
                money: parseFloat(this.form.money)
            },  {
                    headers: {'x-apikey': this.API_KEY}
                }
            ).then(() => {
                console.log('Action edited successfully')
                this.getTransactions()
                this.showEditForm = false
                this.form.action = null
                this.form.crypto = null
                this.form.currency = null
                this.form.amount = null
                this.form.money = null
            }).catch((err) => {
                console.log('Action edition failed: '+err)
            })
        },
        cancelEdit() {
            this.showEditForm = false
            this.form.action = null
            this.form.crypto = null
            this.form.currency = null
            this.form.amount = null
            this.form.money = null
        },
        deleteAction(actionId) {
            axios.delete(`https://crypto-users.onrender.com/actions/${actionId}`, {
                headers: {
                    'x-apikey': this.API_KEY
                }
            }).then(() => {
                this.getTransactions()
            }).catch((err) => {
                console.log('Delete function failed: '+err)
            })
        }
    }
}
</script>