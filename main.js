import axios from "axios";
import * as dotenv from 'dotenv'
import http from 'http'
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

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello World!');
    res.end();
}).listen(8080, '0.0.0.0');