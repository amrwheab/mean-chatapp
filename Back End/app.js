const express = require('express')
const cors = require('cors')
const auth = require('./routs/auth.route')
const msg = require('./routs/msg.route')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config()

mongoose.connect(process.env.DB_Url,{ useNewUrlParser: true, useUnifiedTopology: true }, (mon) => {
  console.log('connected to db')
})

const app = express();

const http = require('http').Server(app)
const io = require('socket.io')(http);
require('./sockets/req.sockets')(io)
require('./sockets/msg.sockets')(io)

app.use(express.static('chatapp'));
app.use('/assets',express.static(path.join(__dirname, 'assets')));


app.use(cors());
app.use(express.json());

app.use('/users', auth);
app.use('/msg', msg);


app.all('*', (req, res , next) => {
  res.sendFile(path.join(__dirname, 'chatapp', 'index.html'))
})

http.listen(3000, () => {
  console.log('server works in port 3000')
})