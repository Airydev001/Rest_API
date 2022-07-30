const express = require('express');
const mongoose = require('mongoose');
const url = 'mongodb://localhost/Users';

const app = express();

mongoose.connect(url, {useNewUrlParser:true})

const con = mongoose.connection;

con.on('open',()=>{
    console.log('connected')
})

app.use(express.json())//inform express that you want to use json
const userListRouter = require("./routes/users.js")
app.use('/user',userListRouter)

app.listen(2100,()=>{
    console.log("Happy Connection");
})