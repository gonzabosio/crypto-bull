<template>

    <div id="top-bar">
        <img src="./icons/bullhead.png" alt="">
        <h1>CryptoBull</h1>
        <div id="end-top-bar">
            <p>Hello, {{ this.$store.state.user.username }}</p>
            <button @click="toTransactions">Transactions</button>
            <button @click="signOut">Sign out</button>
        </div>
    </div>
    <div id="menu-content">
        <div id="selection">
            <h4>Choose crypto</h4>
            <select v-model="selectedCrypto" @change="fetchCrypto">
                <option value="btc">Bitcoin</option>
                <option value="eth">Ethereum</option>
                <option value="usdt">USDT</option>
            </select>

            <h4>Choose currency</h4>
            <select v-model="selectedCurrency" @change="fetchCrypto">
                <option value="usd">USD</option>
                <option value="ars">ARS</option>
            </select>
            
            <h4>Amount</h4>
            <input type="number" min="0" step="0.01" v-model="amount" required>
            <button @click="fetchCrypto">Set</button>
        </div>

        <div v-if="transactionMsg != ''" id="transaction-msg">{{ transactionMsg }}</div>
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <table v-else id="menu-table">
            <thead>
                <tr class="menu-table-rows">
                    <th class="header-row">Exchange</th>
                    <th class="header-row">Purchase</th>
                    <th class="header-row">Sale</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(exchange, name) in exchanges" :key="name" class="menu-table-rows">
                    <td class="body-row">{{ name }}</td>
                    <td class="body-row">$ {{ exchange.ask }} <div><button v-if="exchange.ask > 0" @click="buy(exchange.ask)" class="transaction-btn">Buy</button></div></td>
                    <td class="body-row">$ {{ exchange.bid }} <div><button v-if="exchange.bid > 0" @click="sell(exchange.bid)" class="transaction-btn">Sell</button></div></td>
                </tr>
            </tbody>
        </table>
    </div>

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
                this.errorMsg = ''
                this.transactionMsg = ''
                const response = await axios.get(endpoint)
                this.exchanges = response.data
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
                        this.errorMsg = 'You do not have enough bitcoin to sell'
                    } else {
                        this.sellCrypto(bid, date)
                    }
                } else if (this.selectedCrypto === 'eth') {
                    if (amountEth < this.amount) {
                        window.scrollTo({top: 0, behavior: 'smooth'})
                        this.errorMsg = 'You do not have enough ethereum to sell'
                    } else {
                        this.sellCrypto(bid, date)
                    }
                } else {
                    if (amountUsdt < this.amount) {
                        window.scrollTo({top: 0, behavior: 'smooth'})
                        this.errorMsg = 'You do not have enough usdt to sell'
                    } else {
                        this.sellCrypto(bid, date)
                    }
                }
            }).catch((error) => {
                this.errorMsg = error
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
                this.errorMsg = 'Sale failed'+ err
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

<style>
    #top-bar {
        display: flex;
        align-items: center;
        background-color: rgb(38, 38, 38);
        border-bottom: 2px solid rgba(245, 245, 245, 0.445);
        padding: 10px;
        padding-left: 20px;
    } #top-bar h1 {
        font-size: 38px;
        margin: 0;
    } #top-bar img {
        width: 55px;
        margin-bottom: 10px;
    }

    #end-top-bar {
        margin-left: auto;
    } #end-top-bar p {
        font-size: 24px;
        display: inline;
        margin-right: 60px;
    } #end-top-bar button {
        color: whitesmoke;
        background-color: transparent;
        border: none;
        font-size: 18px;
        font-weight: 600;
        margin-right: 60px;
    } #end-top-bar button:hover {
        cursor: pointer;
        text-decoration: underline;
    }

    #menu-content {
        display: flex;
        flex-direction: column;
        margin-left: 24%;
        margin-right: 24%;
        margin-bottom: 80px;
    }
    #selection {
        margin-bottom: 40px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    } #selection input {
        width: 130px;
        height: 20px;
        font-size: 16px;
    } #selection select {
        width: 100px;
        height: 40px;
        font-size: 16px;
        border-color: transparent;
        border-radius: 6px;
        background-color: rgb(221, 216, 210);
    } #selection button {
        color: rgb(32, 32, 32);
        font-size: 16px;
        width: 80px;
        height: 26px;
        border-color: transparent;
        border-radius: 8px;
        margin-left: 5px;
        background-color: rgb(221, 216, 210);
    } #selection button:hover,select:hover {
        background-color: rgb(238, 234, 229);
        border-color: rgb(221, 216, 210);
        cursor: pointer;
    } #selection h4 {
        margin-top: 30px;
        font-size: 18px;
    }
    #transaction-msg {
        font-size: 20px;
        color: rgb(12, 145, 12);
    }
    #menu-table {
        border-collapse: collapse;
    }
    .header-row {
        border-bottom: 5px solid rgba(245, 245, 245, 0.678);
        font-size: 20px;
        height: 40px;
    }
    .body-row {
        text-align: center;
        font-size: 20px;
        border-top: 1px solid rgba(245, 245, 245, 0.678);
        height: 80px;
    }
    .transaction-btn {
        color: whitesmoke;
        width: 140px;
        height: 40px;
        font-size: 18px;
        border-style: inset;
        background-color: rgb(109, 137, 190);
        border-style: solid;
        border-color: rgb(57, 94, 161);
        border-radius: 8px;
        border-width: 3px;
    }
    .transaction-btn:hover {
        cursor: pointer;
        background-color: rgb(69, 112, 190);
    }
</style>