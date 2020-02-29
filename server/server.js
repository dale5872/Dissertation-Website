const express = require('express');
const session = require('express-session');
const multipart = require('connect-multiparty');
const bodyParser = require('body-parser');
const Promise = require('promise');
const tediousStore = require('connect-tedious')(session);
const cors = require('cors');
const { exec } = require('child_process');

const app = express();

const Login = require('./auth/login.js');
const UserProfile = require('./auth/userProfile.js');
const Registration = require('./auth/registration.js');
const UserInformation = require('./auth/userInformation.js');
const UploadFile = require('./analysis/uploadfile.js');
const Imports = require('./fetch/imports.js');
const Responses = require('./fetch/responses.js');
const Questionnaire = require('./fetch/questionnaire.js');
const Analysis = require('./fetch/analysis.js');
const Classification = require('./update/classification.js');

global.DEBUG_FLAG = true;
//-----------------------------------------------
//----------------- Express Config --------------
//-----------------------------------------------
app.use(session({ 
    secret: 'alskdjghfjlr92345n34£C£(Tegwegcnuerlty3p4t8cnREG[eqEQ{P|[;q9ocruwW|";QW[0ciq0[ewqw[cQW{PRCr',
    cookie: {
        path: '/',
        httpOnly: true,
        secure: false, //REQUIRES HTTPS
        maxAge: 3600000 //1 hour
    },
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

const whitelist = ['http://localhost:4200', 'http://127.0.0.1:4200', 'http://51.11.10.177:4200', 'http://feedbackhub.uksouth.cloudapp.azure.com:4200'];
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }, 
    credentials: true
}
app.use(cors(corsOptions));

const multipartMiddleware = multipart({
    uploadDir: '/home/dale/www/server/tmp/uploadedAnalysisFiles'
});

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
//---------------- AUTH & UPLOAD ----------------
//-----------------------------------------------
app.route('/api/auth/login').post(function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    
    var userProfile = new UserProfile();
    userProfile.loginProfile(username, password);

    if(global.DEBUG_FLAG) {
        console.log(`DEBUG: Recieved POST Request with headers username=${username}:password=${password}`);
    }

    //using promises (i.e., syncronous execution, we authenticate the user)
    var login = new Login(userProfile);
    login.authenticate().then(() => {
        const sessionID = req.sessionID;

        //we now need to add the sessionID to the JSON Object we generate
        var jsonProfile = userProfile.generateProfile();
        jsonProfile.sessionID = sessionID;

        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: User with ID: ${userProfile.userID} has been fetched`);
        }

        //CURRENTLY THE PASSWORD IS STILL STORED IN THE PROFILE
        //THIS MUST BE REMOVED
        req.session.userID = userProfile.userID;
        res.status(200).send(JSON.stringify(jsonProfile));
    }).catch((error) => {
        res.status(500).send(error.message);
    });
});

app.route('/api/auth/register').post(function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var fname = req.body.fname;
    var lname = req.body.lname;

    if(global.DEBUG_FLAG) {
        console.log(`Recieved Registration Request from ${fname} ${lname}`);
    }

    var profile = new UserProfile();
    profile.registerProfile(username, password, fname, lname, email);

    Registration.createAccountTransaction(profile).then((message) => {
        res.send(message);
    }).catch((error) => {
        res.status(500).send(error.message);
    });

});

app.route('/api/auth/userinformation').post((req, res) => {
    if(global.DEBUG_FLAG) {
        if(req.session) {
            console.log(`DEBUG: Fetching User Information, cookie is present`);
        } else {
            console.log(`DEBUG: Fetching User Information, cookie is not present`);
        }
    }

    if(req.session.userID) {
        var userinfo = new UserInformation(req.session.userID);
        userinfo.retrieve().then((profile) => {
            var responseObject = {
                userProfile: profile
            };

            res.status(200).send(JSON.stringify(responseObject));
        }).catch((e) => {
            res.status(500).send(e.message);
        });
    } else {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: UserID was not present in cookie`);
        }
        res.status(401).send("User not Authorized");
    }
});

app.post('/api/uploadfile', multipartMiddleware, (req, res) => {
    if(req.session.userID) {
        var userID = req.session.userID;
        var filepath = req.files.file.path;

        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Uploading file from ${userID}. Storing in ${filepath}`);
            console.log(req.files);
        }

        res.write(`File ${filepath} has been uploaded. Importing into database...`);

        //run the python script
        exec(`python3 '/home/dale/ml/src/initiator.py' --f '${filepath}' --u ${userID} --o ${req.body.filename} --q ${req.body.questionnaireID} > /home/dale/www/server/import_logs/import_${userID}_${req.body.questionnaireID}.log`, (err, stdout, stderr) => {
            if(err) {
                console.log("ERROR: Could not run Python Script for analysis.");
                console.log(err.message);
            }

            if(global.DEBUG_FLAG) {
                console.log("DEBUG: Logging stdout...");
                console.log(stdout);
                console.log(stderr);
            }
        });

        res.write(`File ${filepath} has been imported`);
        res.end();
        // @todo: now to use python to analyse
    } else {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: UserID was not present in cookie. Aborting File Upload`);
        }
        res.status(401).send("User not Authorized");
        // @todo: delete the file again
    }
});

//-----------------------------------------------
//----------------- FETCH -----------------------
//-----------------------------------------------

app.route('/api/fetch/imports').get((req, res) => {
    if(req.session.userID) {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Fetching Imports for user: ${req.session.userID}`);
        }

        var userinfo = new UserInformation(req.session.userID);
        userinfo.retrieve().then((profile) => {
            Imports.fetch(req.session.userID).then((dataObject) => {
                var responseObject = {
                    userProfile: profile,
                    dataObject: dataObject
                };

                if(global.DEBUG_FLAG) {
                    console.log(`DEBUG: Imports Retrieved`);
                    console.log(responseObject.dataObject);
                }
                res.send(responseObject);
            }).catch((error) => {
                res.status(400).send(error.message);
            });
        }).catch((error) => {
            res.status(400).send(error.message);
        });

    } else {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: UserID was not present in cookie. Aborting...`);
        }
        res.status(401).send("User not Authorized");
        // @todo: delete the file again
    }
});


app.route('/api/fetch/single').post((req, res) => {
    if(req.session.userID) {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Fetching Import Information for import: ${req.body.importID}`);
        }

        var userinfo = new UserInformation(req.session.userID);
        userinfo.retrieve().then((profile) => {
            Imports.fetchSingle(req.body.importID).then((dataObject) => {
                var responseObject = {
                    userProfile: profile,
                    dataObject: dataObject
                };

                if(global.DEBUG_FLAG) {
                    console.log(`DEBUG: Import Information Retrieved`);
                    console.log(responseObject.dataObject);
                }
                res.send(responseObject);
            }).catch((error) => {
                console.log(`ERROR: ${error.message}`);
                res.status(400).send(error.message);
            });
        }).catch((error) => {
            console.log(`ERROR: ${error.message}`);
            res.status(400).send(error.message);
        });

    } else {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: UserID was not present in cookie. Aborting...`);
        }
        res.status(401).send("User not Authorized");
        // @todo: delete the file again
    }

});

/********************* */
app.route('/api/fetch/responses').post((req, res) =>  {
    if(req.session.userID) {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Fetching Responses for user: ${req.session.userID}. Import: ${req.body.importID}`);
        }

        var userinfo = new UserInformation(req.session.userID);
        var uip = userinfo.retrieve();

        var fetchResponses = new Responses(req.body.importID);
        var frp = fetchResponses.fetch();

        Promise.all([uip, frp]).then(vals => {
            if(global.DEBUG_FLAG) {
                console.log(`DEBUG: Responses fetched. Sending to client...`);
            }

            var responseObject = {
                userProfile: vals[0],
                dataObject: vals[1]
            }

            res.send(responseObject);
        }).catch((error) => {
            res.status(500).send(error.message);
        });
    } else {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: UserID was not present in cookie. Aborting...`);
        }
        res.status(401).send("User not authorized");
    }
});

app.route('/api/fetch/questionnaire').post((req, res) => {
    if(req.session.userID) {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Fetching Responses for user: ${req.session.userID}. Import: ${req.body.importID}`);
        }

        var userinfo = new UserInformation(req.session.userID);
        var uip = userinfo.retrieve();

        var fetchQuestionnaire = new Questionnaire();
        var fq = fetchQuestionnaire.fetch(req.body.questionnaireID);

        Promise.all([uip, fq]).then(vals => {
            if(global.DEBUG_FLAG) {
                console.log(`DEBUG: Responses fetched. Sending to client...`);
            }

            var responseObject = {
                userProfile: vals[0],
                dataObject: vals[1]
            }

            res.send(responseObject);
        }).catch((error) => {
            res.status(500).send(error.message);
        });
    } else {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: UserID was not present in cookie. Aborting...`);
        }
        res.status(401).send("User not authorized");
    }

});

app.route('/api/fetch/analysis/full').post((req, res) => {
    if(req.session.userID) {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Fetching Analysis for user: ${req.session.userID}. Import: ${req.body.importID}`);
        }

        var userinfo = new UserInformation(req.session.userID);
        var uip = userinfo.retrieve();

        var analysis = Analysis.fetchFullAnalysis(req.body.importID);

        Promise.all([uip, analysis]).then(vals => {
            if(global.DEBUG_FLAG) {
                console.log(`DEBUG: Analysis fetched. Sending to client...`);
            }
            var responseObject = {
                userProfile: vals[0],
                dataObject: vals[1]
            }
            
            res.send(responseObject);
        }).catch((error) => {
            res.status(500).send(error.message);
        });
    } else {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: UserID was not present in cookie. Aborting...`);
        }
        res.status(401).send("User not authorized");
    }

});

app.route('/api/fetch/analysis/similarities').post((req, res) => {
    if(req.session.userID) {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Fetching Analysis Similaritiesx for user: ${req.session.userID}. Import: ${req.body.importID}`);
        }

        var userinfo = new UserInformation(req.session.userID);
        var uip = userinfo.retrieve();

        var similarities = Analysis.fetchSimilarities(req.body.importID);

        Promise.all([uip, similarities]).then(vals => {
            if(global.DEBUG_FLAG) {
                console.log(`DEBUG: Analysis fetched. Sending to client...`);
            }
            var responseObject = {
                userProfile: vals[0],
                dataObject: vals[1]
            }
            
            res.send(responseObject);
        }).catch((error) => {
            res.status(500).send(error.message);
        });
    } else {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: UserID was not present in cookie. Aborting...`);
        }
        res.status(401).send("User not authorized");
    }
});

app.route('/api/fetch/analysis/sentiment').post((req, res) => {
    if(req.session.userID) {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Fetching Analysis Similaritiesx for user: ${req.session.userID}. Import: ${req.body.importID}`);
        }

        var userinfo = new UserInformation(req.session.userID);
        var uip = userinfo.retrieve();

        var similarities = Analysis.fetchSentiment(req.body.importID);

        Promise.all([uip, similarities]).then(vals => {
            if(global.DEBUG_FLAG) {
                console.log(`DEBUG: Analysis fetched. Sending to client...`);
            }
            var responseObject = {
                userProfile: vals[0],
                dataObject: vals[1]
            }
            
            res.send(responseObject);
        }).catch((error) => {
            res.status(500).send(error.message);
        });
    } else {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: UserID was not present in cookie. Aborting...`);
        }
        res.status(401).send("User not authorized");
    }
});


app.route('/api/fetch/questionnaire/all').get((req, res) => {
    if(req.session.userID) {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Creating new questionnaire for user: ${req.session.userID}.`);
        }

        var userinfo = new UserInformation(req.session.userID);
        var uip = userinfo.retrieve();
                
        var qc = Questionnaire.getAll(req.session.userID);

        Promise.all([uip, qc]).then(vals => {
            var responseObject = {
                userProfile: vals[0],
                dataObject: vals[1]
            }

            res.send(responseObject);
        }).catch((error) => {
            res.status(500).send(error.message);
        });
    }
});

app.route('/api/fetch/questionnaire/verify').post((req, res) => {
    var questionnaireID = req.body.questionnaireID;
    
    Questionnaire.verify(questionnaireID).then((questionnaireData) => {
        var responseObject = {
            userProfile: undefined,
            dataObject: questionnaireData
        };
    
        res.send(responseObject);
    }).catch((error) => {
        res.status(418).send("Page not found!");
    });
});

app.route('/api/fetch/questionnaire/questions').post((req, res) => {
    var questionnaireID = req.body.questionnaireID;

    Questionnaire.fetchQuestions(questionnaireID).then((questionnaireQuestions) => {
        var responseObject = {
            userProfile: undefined,
            dataObject: questionnaireQuestions
        };

        res.send(responseObject);
    }).catch((error) => {
        res.status(500).send(error.message);
    });
});

//-----------------------------------------------
//----------------- INSERTS ---------------------
//-----------------------------------------------

/**
 * Imports an already answered questionnaire (i.e., importing a 
 * csv file)
 */
app.route('/api/insert/questionnaire/information').post((req, res) => {
    if(req.session.userID) {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Importing questionnaire for user: ${req.session.userID}.`);
        }

        var userinfo = new UserInformation(req.session.userID);
        var uip = userinfo.retrieve();
        
        var questionnaireData = JSON.parse(req.body.questionnaireData);
        
        var qc = Questionnaire.import(questionnaireData, req.session.userID, false);

        Promise.all([uip, qc]).then(vals => {
            var responseObject = {
                userProfile: vals[0],
                dataObject: vals[1]
            }

            res.send(responseObject);
        }).catch((error) => {
            res.status(500).send(error.message);
        });
    }
});

/**
 * Creates a new questionnaire for users to answer
 */
app.route('/api/insert/questionnaire/new').post((req, res) => {
    if(req.session.userID) {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Creating new questionnaire for user: ${req.session.userID}.`);
        }

        var userinfo = new UserInformation(req.session.userID);
        var uip = userinfo.retrieve();
        
        var questionnaireData = JSON.parse(req.body.questionnaireData);
        
        var qc = Questionnaire.import(questionnaireData, req.session.userID, true);

        Promise.all([uip, qc]).then(vals => {
            var responseObject = {
                userProfile: vals[0],
                dataObject: vals[1]
            }

            res.send(responseObject);
        }).catch((error) => {
            res.status(500).send(error.message);
        });
    }
});

app.route('/api/insert/questionnaire/response').post((req, res) => {
    //we need to put the data into csv format
    var JSONBody = JSON.parse(req.body.questionnaireData);
    var responses = JSONBody.responses;
    var responseString = '';

    console.log(JSONBody);

    responses.forEach((entity) => {
        responseString += entity + ',';
    });

    responseString = responseString.substring(0, responseString.length - 1);

    exec(`python3 \"/home/dale/ml/src/insertResponse.py\" --d \"${responseString}\"  --q ${JSONBody.questionnaireID} --i ${JSONBody.importID} --u ${JSONBody.writerID} 2>&1 | tee -a /home/dale/www/server/response_logs/questionnaire_${JSONBody.questionnaireID}.log`, (err, stdout, stderr) => {
        if(err) {
            console.log("ERROR: Could not run Python Script for analysis.");
            console.log(err.message);
            res.status(500).send(err.message);
        } else {
            if(global.DEBUG_FLAG) {
                console.log("DEBUG: Logging stdout...");
                console.log(stdout);
                console.log(stderr);
            }
            //no error so return OK
            res.send("Inserted");
        }
    });
});

/** 
 * UPDATES
 */
app.route('/api/update/classification').post((req, res) => {
    if(req.session.userID) {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Updating Classification for entity: ${req.body.entityID}.`);
        }

        var userinfo = new UserInformation(req.session.userID);
        var uip = userinfo.retrieve();

        console.log(req.body.entityID);
        console.log(req.body.classification);
        var classificationObj = new Classification(req.body.entityID, req.body.classification);
        classificationObj.updateClassification();
        
        Promise.all([uip, classificationObj]).then((vals) => {
            var responseObject = {
                userProfile: vals[0],
                dataObject: ''
            }
            res.send(responseObject);
        }).catch((error) => {
            res.status(500).send(error.message);
        });
    }
});

/**
 * DESTROYS the current user's session
 */
app.route('/api/destroy/session').delete((req, res) => {
    if(req.session.userID) {
        var userID = req.session.userID;
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Logging out user ${userID}`);
        }
        
        req.session.destroy((err) => {
            console.log(`DEBUG: Destroyed Session. User ${userID} logged out successfully!`);
        });
        res.status(200);
    } else {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: User tried to logout without being authenticated`);
        }
        res.status(401).send("User not authorised");
    }
});

app.route('/api/validate/cookie').get((req, res) => {
    if(req.session.userID) {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Valid cookie for ${req.session.userID}`);
        }
        res.status(200).send("Valid Cookie");
    } else {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: A Cookie has been detected as being invalid`);
        }
        res.status(401).send("Not a valid cookie");
    }
});

app.route('/api/regenerate/cookie').get((req, res) => {
    if(req.session.userID) {
        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Regenerating Cookie for ${req.session.userID}`);
        }
        req.session.regenerate();
        res.status(200).send("Regenerated");
    } else {
        res.status(401).send("User not authorised");
    }
});

app.listen(3000);