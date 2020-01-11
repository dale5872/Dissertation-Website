const Connector = require('../connections/databaseConnector.js');
const { Request } = require('tedious');

class Registration {
    constructor(profile) {
        this.profile = profile;
    }

    async register() {
        try {
            var connector = new Connector();

            let connection = await connector.connect().catch((message) => {
                return false;
            });

            await this.createAccount(connection).catch((message) => {
                return false;
            });

            connection.close();
            return true;
        } catch(err) {
            console.log(`ERROR: ${err.message}`);
        }
    }

    /**
     * TODO: TURN THIS INTO A TRANSACTION IN CASE OF FAILED ATTEMPTS
     * Function creates a new account, and imports the user information given
     * throught the HTTP POST call. If any stage of the registration fails, then 
     * the database will rollback and no changes will be commited.
     * @param {Connection} connection - Tedious Connection Object to the Database
     */
    async createAccount(connection) {
        return new Promise((resolve, reject) => {
            if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                console.log(`DEBUG LEVEL 1: Registration Promise accepted, now registering`);
            }
    
            var accType = this.profile.lecturer ? "Lecturer" : "Student";
    
            //lets create a new request
            var request1 = new Request(
                `INSERT INTO feedbackhub.user_accounts VALUES ('${this.profile.username}', '${this.profile.password}', '${accType}'); 
                SELECT @@IDENTITY;`,
                (err) => {
                    if(err) {
                        console.error("ERROR: An SQL Error Has Occured");
                        console.error(err.message);
                        console.error(`ERROR: Location registration.js, INSERT INTO user_accounts...`);
                        reject();
                    } else {
                        if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                            console.log(`DEBUG LEVEL 1: User Account has been created -> ${this.profile.username}`);
                            console.log(`DEBUG LEVEL 1: Inserting User Information`);
                        }
            
                        //lets create a new request
                        var request2 = new Request(
                            `INSERT INTO feedbackhub.user_information VALUES ('${parseInt(this.profile.userID)}', '${this.profile.fname}', '${this.profile.lname}', '${this.profile.email}')`,
                            (err) => {
                                if(err) {
                                    console.error("ERROR: An SQL Error Has Occured");
                                    console.error(err.message);
                                    console.error(`ERROR: Location registration.js, INSERT INTO user_information...`);
                                    reject();
                                } else {
                                    if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                                        console.log(`DEBUG LEVEL 1: User Information has been inserted ${this.profile.username} -> ${this.profile.userID}`);
                                    }
                                    //everything has succeeded, now we can fulfull the promise
                                    resolve();
                                }
                            }
                        );
                            
                        connection.execSql(request2);
                    }
                }
                );
                
                //Fetch the userID from the above query
                request1.on('row', (columns) => {
                    this.profile.userID = columns[0].value;
                    
                    if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                        console.log(`DEBUG LEVEL 1: USER ID has been generated for ${this.profile.username} -> ${this.userID}`);
                    }
            });
    
            connection.execSql(request1);
        });
    }
}
module.exports = Registration;
