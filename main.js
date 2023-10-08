import axios from "axios";
import * as dotenv from 'dotenv'
import http from 'http'
dotenv.config()
import WebSocket from "ws";
const websocketUrl = "wss://ringotrade.com/ws";
const socket = new WebSocket(websocketUrl);

socket.addEventListener("open", (event) => {
    console.log("Соединение установлено");
});
const first = [false, false];
socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data).data
    const type = JSON.parse(event.data).type
    let fetchData = null
    let url = ''
    if (type === 'last-results') {
        fetchData = JSON.stringify(data.map(item => {
            return {
                value: item.v,
                position: item.c,
                createdDate: item.dt
            }
        }))
    } else if (type === 'factors') {
        if (first[0]) {
            fetchData = JSON.stringify(data.at(-1))

        } else {
            fetchData = JSON.stringify(data)
            first[0] = true
        }
        url = '/socket-factor'
    } else {
        fetchData = JSON.stringify(data)
        url = '/socket-round'
    }
    url = `https://ringo-inky.vercel.app/ringo${url}`
    fetch(url, {
        method: 'POST',
        body: fetchData,
        headers: {
            'Content-Type': 'application/json',
        }
    }).catch(e => {console.log(e.response)})
});

socket.addEventListener("close", (event) => {
    if (event.wasClean) {
        console.log(
            `Соединение закрыто чисто, код: ${event.code}, причина: ${event.reason}`
        );
    } else {
        console.error("Соединение прервано");
    }
});

socket.addEventListener("error", (error) => {
    console.error("Произошла ошибка:", error);
});

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello World!');
    res.end();
}).listen(8080, '0.0.0.0');
