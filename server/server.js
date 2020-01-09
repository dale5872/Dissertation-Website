const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const Promise = require('promise');

var app = express();

const Login = require('./auth/login.js');

global.DEBUG_FLAG = true;

//-----------------------------------------------
//----------------- Express Config --------------
//-----------------------------------------------

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//-----------------------------------------------
//----------------- DEFINED CONTROLLERS ---------
//-----------------------------------------------

app.get('/',function(req,res) {
    if(res.session.loggedin) {
        res.send("User " + res.session.username + " is logged in");
    } else {
        res.send("No user logged in");
    }
    res.end();
});

//-----------------------------------------------
//----------------- API ROUTES ------------------
//-----------------------------------------------
app.route('/api').post(function(req, res) {
    //EXAMPLE API POSR ROUTE
});

app.route('/api/auth/login').post(function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if(global.DEBUG_FLAG) {
        console.log(`Recieved POST Request with headers username=${username}:password=${password}`);
    }

    //using promises (i.e., syncronous execution, we authenticate the user)
    var l = new Login(username, password);
    l.authenticate().then((response) => {
        console.log(`OUTPUT: ${response}`);
        res.send(response);
    }).catch((error) => {
        console.log(`OUTPUT: ${error}`);
        res.send(error);
    });
});


app.listen(3000);