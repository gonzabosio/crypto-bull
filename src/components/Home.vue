<template>

    <div>
        <p>Menu</p>
        <p>User ID: {{ this.$store.state.userId }}</p>
    </div>

    <div>
        <h4>Choose crypto</h4>
        <select v-model="selectedCrypto" @change="fetchCrypto">
            <option value="btc">Bitcoin</option>
            <option value="eth">Ethereum</option>
            <option value="usdt">USDT</option>
        </select>
    </div>

    <div v-if="errorMsg">{{ errorMsg }}</div>
    <table>
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
                <td>{{ exchange.ask }} <div><button @click="buy(name, exchange.ask)">Buy</button></div></td>
                <td>{{ exchange.bid }} <div><button @click="sell(name, exchange.bid)">Sell</button></div></td>
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
            exchanges: {},
            errorMsg: null
        }
    },
    created() {
        this.fetchCrypto()
    },
    methods: {
        async fetchCrypto() {
            let endpoint = `https://criptoya.com/api/${this.selectedCrypto}/ars/0.5`
            try {
                const response = await axios.get(endpoint)
                this.exchanges = response.data
            }
            catch(err) {
                this.errorMsg = err.message
            }
        },
        buy(exchange,ask) {
            console.log("Buying in ", exchange, "for", ask)
        },
        sell(exchange,bid) {
            console.log("Selling in ", exchange, "for", bid)
        }
    }
}
</script>