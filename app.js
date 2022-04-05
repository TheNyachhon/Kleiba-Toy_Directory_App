const express = require('express')
const app = express()

const path = require('path')

const flash = require('connect-flash')
app.use(flash())

// Mongoose for DB and bcrypt for hashing
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const session = require('express-session')

// DB models
const { Users } = require('./models/user')
const { Toys } = require('./models/toy')

//middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// setting up ejs
app.set('view engine', 'ejs')
app.set('views', 'views')

//Session
app.use(session({
    secret: 'supersecretwrod',
    resave: false,
    saveUninitialized: false
}))

// Dotenv
require('dotenv').config()

//connecting to database
// mongoose.connect('mongodb://localhost:27017/Klieba-Toy_Directory_App')
// Database connection
const connectionURL = process.env.url
mongoose.connect(connectionURL)
    .then(() => {
        console.log("Connected to Database!")
    })
    .catch(err => {
        console.log("Connection failed!: ");
        console.log(err);
    })

const checkSession = (req, res, next) => {
    if (req.session.user_id) {
        return res.redirect('/home')
    }
    next()
}
app.get('/', checkSession, (req, res) => {
    res.render('login')
})
app.get('/register', checkSession, (req, res) => {
    res.render('register')
})
// Registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body
    const hashedPw = await bcrypt.hash(password, 12)
    console.log(username)
    console.log(hashedPw)
    const newUser = new Users({
        username,
        password: hashedPw
    })
    console.group(newUser)
    await newUser.save()
    req.session.user_id = newUser._id
    res.redirect('/home')
})

//Opens up login page. If already logged in, opens up home page
app.get('/login', checkSession, (req, res) => {
    res.render('login')
})

//Data captured from login page. If user exists, they are redirected to home page
//Else, redirected to login page
app.post('/login', async (req, res) => {
    const { username, password } = req.body
    // If user exists -> verifies password
    // returns true or false.
    const foundUser = await Users.findAndAuthenticate(username, password)
    if (foundUser) {
        req.session.user_id = foundUser._id
        res.redirect('/home')
    } else {
        res.redirect('/login')
    }
})

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

// If anyone tries to access home page directly, session will be check first
// If already logged in, it opens up else redirected to login page.
app.get('/home', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    res.render('home')
})

//Toy add part
app.get('/add', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    res.render('add', { message: req.flash('message') })
})
// Receiving toy data input from form
app.post('/add', async (req, res) => {
    const { id, name ,desc} = req.body
    const newToy = new Toys({
        toyid: id,
        name:name.toLowerCase(),
        desc:desc.toLowerCase()
    })
    await newToy.save()
    req.flash('message', 'added')
    res.redirect('add')
})
//Toy Search part
app.get('/search', (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    // req.flash('toyInfo','not found')
    res.render('search', { toyInfo: req.flash('toyInfo') })
})
// Receiving toy data input from form to search
app.post('/search', async (req, res) => {
    const { name } = req.body
    await Toys.findOne({ name: name.toLowerCase() })
        .then(toyData => {
            if (toyData != null) {
                // console.log(toyData)
                req.flash('toyInfo', 'found')
                return res.render('search', { toyData, toyInfo: req.flash('toyInfo') })
            }
            req.flash('toyInfo', 'not found')
            res.redirect('search')

        })
        .catch(e=>{
            console.log('error')
            console.log(e)
        })
})

// Toy data modify
app.post('/edit',async(req,res)=>{
    const {id,name,desc } = req.body
    await Toys.findOneAndUpdate({ toyid: id }, {name:name.toLowerCase(),desc:desc.toLowerCase()})
    res.redirect('search')
})


app.listen(process.env.PORT, () => {
    console.log('Listening on 3000!')
})