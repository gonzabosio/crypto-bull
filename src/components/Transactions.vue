<template>
    <div id="top-bar">
        <img src="./icons/bullhead.png" alt="">
        <h1>CryptoBull</h1>
    </div>
    <div id="transaction-content">
        <h1>History</h1>
        <label v-if="!showEditForm" id="summary-lbl">Summary<input v-model="showSummary" type="checkbox"/></label>
        <p v-if="err != ''">{{ err }}</p>
        <div v-if="!showEditForm && !showSummary && !err != ''">
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Action</th>
                        <th>Crypto</th>
                        <th>Amount</th>
                        <th>Currency</th>
                        <th>Money</th>
                        <th>Datetime</th>
                        <th></th>
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
                        <td>
                            <div id="btn-container">
                                <button @click="showForm(transaction.activity_id, transaction.action, transaction.currency, transaction.crypto_code)" id="edit-btn">Edit</button>
                                <button @click="deleteAction(transaction.activity_id)" id="delete-btn">Delete</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else-if="showEditForm && !showSummary" id="form-container">
            <h2>Edition</h2>
            <p>Empty fields allowed</p>
            <form @submit.prevent="saveEdit" id="form-content">
                <label>Action<br><input :placeholder="editionForm.action" readonly></label><br>
                <label>Crypto<br><select v-model="editionForm.crypto">
                    <option value="btc">Bitcoin</option>
                    <option value="eth">Ethereum</option>
                    <option value="usdt">USDT</option>
                </select></label><br>
                <label>Amount<br><input type="number" step="0.01" min="0" v-model="editionForm.amount"></label><br>
                <label>Currency<br><select v-model="editionForm.currency">
                    <option value="usd">USD</option>
                    <option value="ars">ARS</option>
                </select></label><br>
                <label>Money<br><input type="number" step="0.01" min="0" v-model="editionForm.money"></label><br>
                <div>   
                    <button type="button" @click="cancelEdit">Cancel</button>
                    <button type="submit">Save</button>
                </div>
            </form>
            <p v-if="formError != ''">{{ formError }}</p>
        </div>

        
        <table v-if="showSummary" class="history-table">
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
            editionForm: {
                action: null,
                crypto: null,
                currency: null,
                amount: null,
                money: null
            },
            formError: '',
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
        showForm(actionID, action, currency, cryptoCode) {
            this.actionId = actionID
            this.editionForm.action = action
            this.editionForm.currency = currency
            this.editionForm.crypto = cryptoCode
            this.showEditForm = true
        },
        saveEdit() {
                axios.patch(`https://crypto-users.onrender.com/actions/${this.actionId}`, {
                action: this.editionForm.action,
                crypto_code: this.editionForm.crypto,
                currency: this.editionForm.currency,
                crypto_amount: parseFloat(this.editionForm.amount),
                money: parseFloat(this.editionForm.money)
            },  {
                    headers: {'x-apikey': this.API_KEY}
                }).then(() => {
                this.getTransactions()
                this.editionForm.money = null
                this.editionForm.amount = null
                this.showEditForm = false
            }).catch((err) => {
                this.formError = 'Edition failed - '+ err
            })
        },
        cancelEdit() {
            this.showEditForm = false
            this.formError = ''
            this.editionForm.action = null
            this.editionForm.crypto = null
            this.editionForm.currency = null
            this.editionForm.amount = null
            this.editionForm.money = null
        },
        deleteAction(actionId) {
            axios.delete(`https://crypto-users.onrender.com/actions/${actionId}`, {
                headers: {
                    'x-apikey': this.API_KEY
                }
            }).then(() => {
                this.getTransactions()
            }).catch((err) => {
                this.err = 'Action delete failed -'+err
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

<style>
#transaction-content {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-left: 16%;
    margin-right: 16%;
}
#summary-lbl {
    font-size: 20px;
    margin-top: 6px;
    margin-bottom: 20px;
}
input[type=checkbox] {
    transform: scale(1.5);
}
.history-table {
    border-collapse: collapse;
}
.history-table th {
    height: 40px;
    width: 200px;
    font-size: 20px;
    border-bottom: 3px solid rgba(245, 245, 245, 0.678);
}
.history-table td {
    height: 60px;
    width: 300px;
    text-align: center;
    font-size: 18px;
    border-top: 1px solid rgba(245, 245, 245, 0.678);
}
#btn-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
}
#edit-btn {
    width: 80px;
    height: 40px;
    color: whitesmoke;
    font-size: 16px;
    font-weight: 600;
    background-color: rgb(31, 126, 31);
    border: 3px solid rgb(16, 58, 15);
    border-radius: 6px;
    margin-right: 16px;
} #edit-btn:hover {
    background-color: rgb(34, 110, 32);
    cursor: pointer;
}
#delete-btn {
    width: 80px;
    height: 40px;
    color: whitesmoke;
    font-size: 16px;
    font-weight: 600;
    background-color: rgb(184, 12, 12);
    border: 3px solid rgb(102, 11, 11);
    border-radius: 6px;
} #delete-btn:hover {
    background-color: rgb(165, 18, 18);
    cursor: pointer;
}

#form-container {
    width: 400px;
    padding-left: 80px;
    padding-right: 80px;
    padding-top: 20px;
    padding-bottom: 40px;
    border-radius: 30px;
    border-left: 2px solid rgba(245, 245, 245, 0.678);
    border-right: 2px solid rgba(245, 245, 245, 0.678);
}
#form-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 40px;
}
#form-content input, select{
    width: 200px;
    height: 24px;
}
#form-content button[type="submit"] {
    width: 90px;
    height: 40px;
    font-size: 16px;
    font-weight: 600;
    background-color: whitesmoke;
    border: none;
    border-radius: 4px;
    margin-left: 20px;
} #form-content button[type="submit"]:hover {
    cursor: pointer;
    border: 3px solid rgb(173, 168, 168);
}
#form-content button[type="button"] {
    width: 90px;
    height: 40px;
    font-size: 16px;
    font-weight: 600;
    background-color: darkgray;
    border: none;
    border-radius: 4px;
} #form-content button[type="button"]:hover {
    cursor: pointer;
    border: 3px solid rgb(95, 92, 92);
}
</style>