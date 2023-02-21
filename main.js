import axios from "axios";
import * as dotenv from 'dotenv'
dotenv.config()
setInterval(async () => {
    try {
        await axios({
            method: "GET",
            url: process.env.API_URL
        })
        console.log('foo')
    } catch (e) {
    }
}, 10000)
