const express = require('express');
const app = express();
app.use(express.urlencoded());

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/login-project')
    .then(()=>{
        console.log('Mongo successfully connected')
    }).catch(err=>{
        console.log('Mongo connection error =>',err)
    });

const ejsMate = require('ejs-mate'); 
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

const port = 3000
app.listen(port, ()=>{
    console.log('Listening on port', port)
})


app.get('/', (req,res)=>{
    res.render('home')
})
app.get('/login', (req,res)=>{
    res.render('login/login')
})
app.get('/reg', (req,res)=>{
    res.render('login/register')
})
