<template>
    <h2>History</h2>
    <div v-if="err != ''">{{ err }}</div>
    <label v-if="!showEditForm">Summary<input v-model="showSummary" type="checkbox"/></label>
    <div v-if="!showEditForm && !showSummary && !err != ''">
        <table>
            <thead>
                <tr>
                    <th>Action</th>
                    <th>Crypto</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Money</th>
                    <th>Datetime</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(transaction) in transactions">
                    <td>{{ transaction.action }}</td>
                    <td>{{ transaction.crypto_code }}</td>
                    <td>{{ transaction.crypto_amount }}</td>
                    <td>{{ transaction.currency }}</td>
                    <td>$ {{ transaction.money }}</td>
                    <td>{{ transaction.performed_at }}</td>
                    <button @click="showForm(transaction.activity_id)">Edit</button>
                    <button @click="deleteAction(transaction.activity_id)">Delete</button>
                </tr>
            </tbody>
        </table>
    </div>
    <form v-else-if="showEditForm && !showSummary" @submit.prevent="saveEdit">
        <h4>Edition</h4>
        <p>You can leave any text box empty</p>
        <label>Action<input type="text" v-model="form.action"/></label><br>
        <label>Crypto<input type="text" v-model="form.crypto"></label><br>
        <label>Amount<input type="text" v-model="form.amount"></label><br>
        <label>Currency<input type="text" v-model="form.currency"></label><br>
        <label>Money<input type="text" v-model="form.money"></label><br>
        <button type="button" @click="cancelEdit">Cancel</button>
        <button type="submit">Save</button>
    </form>
    <table v-if="showSummary">
        <thead>
            <tr>
                <th>Crypto</th>
                <th>Amount</th>
                <th>Balance(ARS)</th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="summary.amount.btc != 0">
                <td>Bitcoin</td>
                <td>{{ summary.amount.btc }}</td>
                <td>$ {{ summary.money.btc}}</td>
            </tr>
            <tr v-if="summary.amount.eth != 0">
                <td>Ethereum</td>
                <td>{{ summary.amount.eth }}</td>
                <td>$ {{ summary.money.eth }}</td>
            </tr>
            <tr v-if="summary.amount.usdt != 0">
                <td>USDT</td>
                <td>{{ summary.amount.usdt }}</td>
                <td>$ {{ summary.money.usdt }}</td>
            </tr>
            <tr>
                <td>Total(ARS)</td>
                <td></td>
                <td>$ {{ summary.total }}</td>
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
            showEditForm: false,
            actionId: '',
            form: {
                action: null,
                crypto: null,
                currency: null,
                amount: null,
                money: null
            },
            showSummary: false,
            summary: {
                bid: {btc: 0,eth: 0,usdt: 0},
                ask: {btc: 0,eth: 0,usdt: 0},
                amount: {btc: 0,eth: 0,usdt: 0},
                money: {btc: 0,eth: 0,usdt: 0},
                totalAsk: {btc: 0,eth: 0,usdt: 0},
                totalBid: {btc: 0,eth: 0,usdt: 0},
                total: 0
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
                    this.calculate(response.data)
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
            if (this.form.action != null && this.form.action != 'purchase' && this.form.action != 'sell') {
                this.err = "You can edit the action only writing 'purchase' or 'sell'"
            } else {
                axios.patch(`https://crypto-users.onrender.com/actions/${this.actionId}`, {
                action: this.form.action,
                crypto_code: this.form.crypto,
                currency: this.form.currency,
                crypto_amount: parseFloat(this.form.amount),
                money: parseFloat(this.form.money)
            },  {
                    headers: {'x-apikey': this.API_KEY}
                }).then(() => {
                console.log('Action edited successfully')
                this.getTransactions()
                this.showEditForm = false
                this.err = ''
                this.form.action = null
                this.form.crypto = null
                this.form.currency = null
                this.form.amount = null
                this.form.money = null
            }).catch((err) => {
                console.log('Action edition failed: '+err)
            })
            }
        },
        cancelEdit() {
            this.showEditForm = false
            this.err = ''
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
        },
        async calculate(transactions) {
            this.summary.amount.btc = 0
            this.summary.amount.eth = 0
            this.summary.amount.usdt = 0
            this.summary.money.btc = 0
            this.summary.money.eth = 0
            this.summary.money.usdt = 0
            await axios.get('https://criptoya.com/api/btc/ars/1').then((response) => {
                this.summary.totalAsk.btc = response.data.argenbtc.totalAsk
                this.summary.totalBid.btc = response.data.argenbtc.totalBid
            }).catch((err) => {
                console.log(err)
            })
            await axios.get('https://criptoya.com/api/eth/ars/1').then((response) => {
                this.summary.totalAsk.eth = response.data.argenbtc.totalAsk
                this.summary.totalBid.eth = response.data.argenbtc.totalBid
            }).catch((err) => {
                console.log(err)
            })
            await axios.get('https://criptoya.com/api/usdt/ars/1').then((response) => {
                this.summary.totalAsk.usdt = response.data.argenbtc.totalAsk
                this.summary.totalBid.usdt = response.data.argenbtc.totalBid
            }).catch((err) => {
                console.log(err)
            })
            const entries = Object.entries(transactions)
            for (const [key, value] of entries) {
                switch(value.crypto_code) {
                    case 'btc': {
                        if (value.action === 'purchase') {
                            this.summary.amount.btc += value.crypto_amount
                            if (value.currency === 'usd') {
                                this.summary.money.btc += value.crypto_amount * this.summary.totalAsk.btc
                            } else {
                                this.summary.money.btc += value.money
                            }

                        } else {
                            this.summary.amount.btc -= value.crypto_amount
                            if (value.currency === 'usd') {
                                this.summary.money.btc -= value.crypto_amount * this.summary.totalBid.btc
                            } else {
                                this.summary.money.btc -= value.money
                            }
                        }
                        break
                    }
                    case 'eth': {
                        if (value.action === 'purchase') {
                            this.summary.amount.eth += value.crypto_amount
                            if (value.currency === 'usd') {
                                this.summary.money.eth += value.crypto_amount * this.summary.totalAsk.eth
                            } else {
                                this.summary.money.eth += value.money
                            }
                        } else {
                            this.summary.amount.eth -= value.crypto_amount
                            if (value.currency === 'usd') {
                                this.summary.money.eth -= value.crypto_amount * this.summary.totalBid.eth
                            } else {
                                this.summary.money.eth -= value.money
                            }
                        }
                        break
                    }
                    case 'usdt': {
                        if (value.action === 'purchase') {
                            this.summary.amount.usdt += value.crypto_amount
                            if (value.currency === 'usd') {
                                this.summary.money.usdt += value.crypto_amount * this.summary.totalAsk.usdt
                            } else {
                                this.summary.money.usdt += value.money
                            }
                            this.summary.money.usdt += value.money
                        } else {
                            this.summary.amount.usdt -= value.crypto_amount
                            if (value.currency === 'usd') {
                                this.summary.money.usdt -= value.crypto_amount * this.summary.totalBid.usdt
                            } else {
                                this.summary.money.usdt -= value.money
                            }
                        }
                        break;
                    }
                }
            }
            this.summary.total = this.summary.money.btc + this.summary.money.eth + this.summary.money.usdt
        }
    }
}
</script>