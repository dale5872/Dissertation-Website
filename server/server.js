const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const Promise = require('promise');
const tediousStore = require('connect-tedious')(session);

const app = express();

const Login = require('./auth/login.js');
const UserProfile = require('./auth/userProfile.js');
const Registration = require('./auth/registration.js');
const Connector = require('./connections/databaseConnector.js');

const connector = new Connector();
const connectorConfig = connector.getConfig();

console.log(connectorConfig);

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
    secret: 'alskdjghfjlr92345n34£C£(Tegwegcnuerlty3p4t8cnREG[eqEQ{P|[;q9ocruwW|";QW[0ciq0[ewqw[cQW{PRCr',
    store: new tediousStore({
        config: {
            userName: 'dale',
            password: 'EdenHazard10',
            server: 'feedback-hub.database.windows.net',
            options: {
                database: "FeedbackHub",
                encrypt: true
            }
        }
    }),
    saveUnitialized: false,
    resave: false
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
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
    if(req.session.userID) {
        if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
            console.log(`User ${req.session.userID} is already logged in`);
        }
        return res.status(401).send("Already Authenticated");
    }
    var username = req.body.username;
    var password = req.body.password;
    
    var profile = new UserProfile();
    profile.loginProfile(username, password);

    if(global.DEBUG_FLAG) {
        console.log(`Recieved POST Request with headers username=${username}:password=${password}`);
    }

    //using promises (i.e., syncronous execution, we authenticate the user)
    var login = new Login(profile);
    login.authenticate().then((message) => {
        const userID = profile.userID;

        if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
            console.log(`DEBUG LEVEL 1: User with ID: ${userID} has been fetched`);
        }

        req.session.userID = userID;
        res.status(200).send("User Authenticated");
    }).catch((error) => {
        res.status(401).send(error.message);
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

    var profile = new UserProfile();
    profile.registerProfile(username, password, fname, lname, email, lecturer);

    var reg = new Registration(profile);
    reg.register().then((message) => {
        res.send(message);
    });

});

app.listen(3000);