const express = require('express');
const app = express();
app.use(express.urlencoded());
const port = 3000;
app.listen(port,()=>{
    console.log('Listening on port 3000');
});

const session = require('express-session')
app.use(session({
    secret: 'weaksecretboi',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,//po 7 dnaich sie przedawnia
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/login-test')
    .then(()=>{
        console.log('Mongo successfully connected')
    }).catch(err=>{
        console.log('Mongo connection error =>',err)
    });
const User = require('./models/user')

const path = require('path');
app.use(express.static(path.join(__dirname,'public')))

const ejsMate = require('ejs-mate');
const req = require('express/lib/request');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

const passport = require('passport')
const passportLocal = require('passport-local')
app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use((req,res,next)=>{
    console.log(req.session)
    res.locals.currentUser = req.user;
    next()
})

app.get('/', (req,res)=>{
    console.log(req.session.username)
    res.render('home');
});
app.get('/users', checkAuthentication,async(req,res)=>{
    const users =  await User.find({})
    res.render('showusers', {users})
});

app.get('/reg', (req,res)=>{
    console.log(req.session.username)
    res.render('register')
})
app.post('/reg', async(req,res)=>{
    const {email,username,password,passwordConfirm} = req.body;
    try{
        if(password==passwordConfirm){
        const user = new User({email, username, password});
        const registeredUser = await User.register(user, password);
        console.log(registeredUser)
        res.redirect('/users')
        
    }else{
        res.redirect('/login')
    }
    }catch(err){
        console.log(err)
        res.redirect('/')
    }
});
app.get('/login', (req,res)=>{
    console.log(req.session.username)
    res.render('login')
});
app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),  function(req, res) {
	console.log(req.user)
	res.redirect('/users')
});

app.get('/logout',(req,res)=>{
    req.logOut()
    res.redirect('/')
})


function checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        next();
    } else{
        res.redirect("/login");
    }
}