const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const Promise = require('promise');

var app = express();

const Login = require('./auth/login.js');
const RegistrationProfile = require('./auth/registrationProfile.js');
const Registration = require('./auth/registration.js');

global.DEBUG_FLAG = true;
global.DEBUG_LEVEL = 1; //1 = EVERYTHING, 2 = MAIN OPERATIONS

if(global.DEBUG_LEVEL) {
    switch(global.DEBUG_LEVEL) {
        case 1:
            console.log(`DEBUG LEVEL 1 ENABLED. EVERYTHING WILL BE LOGGED.
            THIS IS FOR DEVELOPMENT PURPOSES ONLY`);
            break;
        case 2:
            console.log(`DEBUG LEVEL 2 ENABLED. ALL MAJOR OPERATIONS (INCLUDING TRANSMITTED INFORMATION)
            WILL BE LOGGED.
            THIS IS FOR DEVELOPMENT PURPOSES ONLY`);
            break;
    }
}

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

app.route('/api/auth/register').post(function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var lecturer = req.body.lecturer;

    if(global.DEBUG_FLAG) {
        console.log(`Recieved Registration Request from ${fname} ${lname}`);
    }

    var profile = new RegistrationProfile(username, password, fname, lname, email, lecturer);

    var reg = new Registration(profile);
    reg.register().then((message) => {
        res.send(message);
    });

});

app.listen(3000);