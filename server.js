const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const serverrun = `Server is running ${PORT}`;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATA
});

db.connect((err) => {
    if (err) {
        console.error('Error connection to database');
    } else {
        console.log('Connected to database');
    }
});

// page index

app.get('/', (req, res) => {
    res.render('index', { session: req.session });
});

// page register

app.get('/register', (req, res) => {
    res.render('register', { session: req.session });
});

// page login

app.get('/login', (req, res) => {
    res.render('login', { session: req.session });
});

// page profile

app.get('/profile', (req, res) => {
    if (req.session.loggedin) {
        res.render('profile', { username: req.session.username });
    } else {
        res.redirect('/')
    }
});

// Apiendpoint register

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, password], (err, result) => {
        if (err) throw err;
        console.log('User registered successfully');
        res.redirect('/login');
    });
});

// Apiendpoint login

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/profile');
        } else {
            res.render('login', { error: 'Incorrect username or password' })
        }
    });
});

// Apiendpoint logout

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

// server running

app.listen(PORT, () => {
    console.log(serverrun);
});