<template>

    <div>
        <h1>CryptoBull</h1>
        <p>Hello, {{ this.$store.state.user.username }}</p>
        <button @click="toTransactions">Transactions</button>
    </div>
    <button @click="signOut">Sign out</button>

    <div>
        <h4>Choose crypto</h4>
        <select v-model="selectedCrypto" @change="fetchCrypto">
            <option value="btc">Bitcoin</option>
            <option value="eth">Ethereum</option>
            <option value="usdt">USDT</option>
        </select>
    </div>

    <div>
        <h4>Choose currency</h4>
        <select v-model="selectedCurrency" @change="fetchCrypto">
            <option value="usd">USD</option>
            <option value="ars">ARS</option>
        </select>
    </div>

    <div>
        <h4>Amount</h4>
        <input type="number" min="0" step="0.01" v-model="amount" required>
        <button @click="fetchCrypto">Set</button>
    </div>

    <div v-if="transactionMsg != ''">{{ transactionMsg }}</div>
    <div v-if="errorMsg">{{ errorMsg }}</div>
    <table v-else>
        <thead>
            <tr>
                <th>Exchange</th>
                <th>Purchase</th>
                <th>Sale</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(exchange, name) in exchanges" :key="name">
                <td>{{ name }}</td>
                <td>$ {{ exchange.ask }} <div><button v-if="exchange.ask > 0" @click="buy(exchange.ask)">Buy</button></div></td>
                <td>$ {{ exchange.bid }} <div><button v-if="exchange.bid > 0" @click="sell(exchange.bid)">Sell</button></div></td>
            </tr>
        </tbody>
    </table>

</template>

<script>
import axios from 'axios'

export default {
    name: 'Home',
    data() {
        return {
            selectedCrypto: 'btc',
            selectedCurrency: 'ars',
            exchanges: {},
            amount: 1,
            errorMsg: null,
            transactionMsg: '',
            API_KEY: import.meta.env.VITE_API_KEY
        }
    },
    created() {
        this.fetchCrypto()
    },
    methods: {
        async fetchCrypto() {
            let endpoint = `https://criptoya.com/api/${this.selectedCrypto}/${this.selectedCurrency}/${this.amount}`
            try {
                const response = await axios.get(endpoint)
                this.exchanges = response.data
                this.transactionMsg = ''
            }
            catch(err) {
                this.errorMsg = err.message
            }
        },
        buy(ask) {
            const date = getDate()
            const userId = this.$store.state.user.id
            axios.post(`https://crypto-users.onrender.com/actions`,
                {
                    action: "purchase",
                    crypto_code: this.selectedCrypto,
                    currency: this.selectedCurrency,
                    crypto_amount: this.amount,
                    money: parseFloat(ask),
                    performed_at: date,
                    user_id: userId
                }, 
                {
                    headers: {
                        'x-apikey': this.API_KEY
                    }
                }).then(() => {
                    window.scrollTo({top: 0, behavior: 'smooth'})
                    this.transactionMsg = 'Successful purchase'
            }).catch((err) => {
                console.log('Purchase failed: '+err)
            })
        },
        sell(bid) {
            const date = getDate()
            axios.get(`https://crypto-users.onrender.com/actions/${this.$store.state.user.id}`, {              
                headers: {'x-apikey': this.API_KEY}       
            }).then((response) => {
                let amountBtc = 0
                let amountEth = 0
                let amountUsdt = 0
                const entries = Object.entries(response.data)
                for (const [key, value] of entries) {
                    switch(value.crypto_code) {
                        case 'btc': {
                            if (value.action === 'purchase') {
                                amountBtc += value.crypto_amount
                            } else {
                               amountBtc -= value.crypto_amount
                            }
                            break
                        }
                        case 'eth': {
                            if (value.action === 'purchase') {
                                amountEth += value.crypto_amount
                            } else {
                                amountEth -= value.crypto_amount
                            }
                            break
                        }
                        case 'usdt': {
                            if (value.action === 'purchase') {
                                amountUsdt += value.crypto_amount
                            } else {
                                amountUsdt -= value.crypto_amount
                            }
                            break;
                        }
                    }
                }
                if (this.selectedCrypto === 'btc') {
                    if (amountBtc < this.amount) {
                        window.scrollTo({top: 0, behavior: 'smooth'})
                        this.transactionMsg = 'You do not have enough bitcoin to sell'
                    } else {
                        this.sellCrypto(bid, date)
                    }
                } else if (this.selectedCrypto === 'eth') {
                    if (amountEth < this.amount) {
                        window.scrollTo({top: 0, behavior: 'smooth'})
                        this.transactionMsg = 'You do not have enough ethereum to sell'
                    } else {
                        this.sellCrypto(bid, date)
                    }
                } else {
                    if (amountUsdt < this.amount) {
                        window.scrollTo({top: 0, behavior: 'smooth'})
                        this.transactionMsg = 'You do not have enough usdt to sell'
                    } else {
                        this.sellCrypto(bid, date)
                    }
                }
            }).catch((error) => {
                this.transactionMsg = error
            })
        },
        sellCrypto(bid, date) {
            axios.post(`https://crypto-users.onrender.com/actions`,
            {
                action: "sell",
                crypto_code: this.selectedCrypto,
                currency: this.selectedCurrency,
                crypto_amount: this.amount,
                money: parseFloat(bid),
                performed_at: date,
                user_id: this.$store.state.user.id
            }, 
            {
                headers: {
                    'x-apikey': this.API_KEY
                }
            }).then(() => {
                window.scrollTo({top: 0, behavior: 'smooth'})
                this.transactionMsg = 'Successful sale'
            }).catch((err) => {
                this.transactionMsg = 'Sale failed'+ err
            })
        },
        toTransactions() {
            this.$router.push('/transactions')
        },
        signOut() {
            this.$store.commit('saveUser', {
                id: null,
                username: null
            })
            this.$router.replace('/')
        },
    }
}
function getDate() {
    const date = new Date()
    const pad = (num) => num.toString().padStart(2, '0')
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    const seconds = pad(date.getSeconds())
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`
}
</script>