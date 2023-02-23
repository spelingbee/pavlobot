import axios from "axios";
import * as dotenv from 'dotenv'
dotenv.config()
setInterval(async () => {
    try {
        await axios({
            method: "POST",
            url: process.env.API_URL + '/checkouts/check'
        })
    } catch (e) {
        console.log(e)
    }
}, 2000)
