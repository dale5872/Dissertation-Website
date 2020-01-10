const Connector = require('../connections/databaseConnector.js');
const { Request } = require('tedious');

class Registration {
    constructor(profile) {
        this.profile = profile;
    }

    register() {
        this.createAccount().then(() => {
             this.insertUserInformation()
             .catch(() => { 
                 //THIS IS BEING CAUGHT NO MATTER WHAT HAPPENS IN createAccount()
                 console.error("ERROR: Failed to register user. User information was not added"); 
                 return false; 
            });
        })
        .catch(() => { 
            console.error("ERROR: Failed to Create User Account"); 
            return false; 
        });

        return true;
    }

    async createAccount() {
        var connector = new Connector();
            
        connector.connect().then((connection) => {
            if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                console.log(`DEBUG LEVEL 1: Registration Promise accepted, now registering`);
            }

            var accType = this.profile.lecturer ? "Lecturer" : "Student";
            var userID;

            //lets create a new request
            var request1 = new Request(
                `INSERT INTO feedbackhub.user_accounts VALUES ('${this.profile.username}', '${this.profile.password}', '${accType}'); 
                SELECT @@IDENTITY;`,
                (err) => {
                    if(err) {
                        console.error("ERROR: An SQL Error Has Occured");
                        console.error(err.message);
                        console.error(`ERROR: Location registration.js, INSERT INTO user_accounts...`);
                        throw("An error has occured");
                    } else {
                        if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                            console.log(`DEBUG LEVEL 1: User Account has been created -> ${this.profile.username}`);
                        }
                    }
                }
            );

            //Fetch the userID from the above query
            request1.on('row', (columns) => {
                this.userID = columns[0].value;

                if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                    console.log(`DEBUG LEVEL 1: USER ID has been generated for ${this.profile.username} -> ${this.userID}`);
                }
            });

            connection.execSql(request1);
        });

        return true;
    }

    async insertUserInformation() {
        var obj = this; //we need to preserve the current objects reference

        connector.connect().then((connection) => {

            //lets create a new request
            var request2 = new Request(
                `INSERT INTO feedbackhub.user_information VALUES ('${this.profile.userID}', '${this.profile.fname}', '${this.profile.lname}', '${this.profile.email}')`,
                (err) => {
                    if(err) {
                        console.error("ERROR: An SQL Error Has Occured");
                        console.error(err.message);
                        console.error(`ERROR: Location registration.js, INSERT INTO user_information...`);
                        throw("An error has occured");
                    } else {
                        if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                            console.log(`DEBUG LEVEL 1: User Information has been inserted ${this.profile.username} -> ${userID}`);
                        }
                        //everything has succeeded, now we can fulfull the promise
                        resolve("User has been registered!");
                        connection.close();
                    }
                }
            );

            connection.execSql(request2);
        });

        return true;
    }

}

module.exports = Registration;