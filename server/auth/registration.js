const Connector = require('../connections/databaseConnector.js');
const { Request } = require('tedious');

class Registration {
    constructor(profile) {
        this.profile = profile;
    }

    async register() {
        var connector = new Connector();
        var error = false; 
        //if throwing error in the catch block, NodeJS Complains
        //could possibly be solved in a try / catch block

        let connection = await connector.connect().catch((error) => {
            error = true;
        });

        if(error) {
            throw new Error("Failed to connect to database");
        }

        outputMessage = await this.createAccountTransaction(connection).catch((error) => {
            error = true;
        });

        if(error) {
            throw new Error("Failed to register the user");
        }

        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Closing Database Connection`);
        }
        connection.close();
    }

    /**
     * Function creates a new account, and imports the user information given
     * throught the HTTP POST call. If any stage of the registration fails, then 
     * the database will rollback and no changes will be commited.
     * @param {Connection} connection - Tedious Connection Object to the Database
     */
    async createAccountTransaction(connection) {
        return new Promise((resolve, reject) => {
            if(global.DEBUG_FLAG) {
                console.log(`DEBUG: Registration Promise accepted, now registering`);
            }
    
            connection.beginTransaction((err) => {
                if(err) {
                    console.error(`ERROR: A FATAL ERROR HAS OCCURED`);
                    console.error(`${err.message}`);
                    reject("An unknown error has occured. Contact an administrator for help");
                }
                var accType = this.profile.lecturer ? "Lecturer" : "Student";
        
                //lets create a new request for creating the user account
                var request1 = new Request(
                    `INSERT INTO feedbackhub.user_accounts VALUES ('${this.profile.username}', '${this.profile.password}'); 
                    SELECT @@IDENTITY;`,
                    (err) => {
                        if(err) {
                            console.error("ERROR: An SQL Error Has Occured");
                            console.error(err.message);
                            console.error(`ERROR: Location registration.js, INSERT INTO user_accounts...`);
                            if(global.DEBUG_FLAG) {
                                console.log(`DEBUG: Rolling back transaction...`);
                                console.log(`DEBUG: Username ${this.profile.username}' was already taken`);
                            }

                            //we have an error, rollback the transaction
                            connection.rollbackTransaction((err) => {
                                if(err) {
                                    console.error(`ERROR: A FATAL ERROR HAS OCCURED`);
                                    console.error(`${err.message}`);
                                    if(global.DEBUG_FLAG) {
                                        console.log(`DEBUG: Failed to rollback`);
                                    }
                                    reject("An unknown error has occured. Contact an administrator for help");
                                } else {
                                    //The username was already taken
                                    console.log();
                                    if(global.DEBUG_FLAG) {
                                        console.log(`DEBUG: Rollbacked successfully`);
                                    }
                                    reject(`This username '${this.profile.username}' has already been taken.`);
                                }
                            });
                        } else {
                            if(global.DEBUG_FLAG) {
                                console.log(`DEBUG: User Account has been created -> ${this.profile.username}`);
                                console.log(`DEBUG: Inserting User Information`);
                            }

                            //we have created the account, now we create a new request to insert the user's information
                            //into the table with the new userID
                            var request2 = new Request(
                                `INSERT INTO feedbackhub.user_information VALUES ('${parseInt(this.profile.userID)}', '${this.profile.fname}', '${this.profile.lname}', '${this.profile.email}')`,
                                (err) => {
                                    if(err) {
                                        console.error("ERROR: An SQL Error Has Occured");
                                        console.error(err.message);
                                        console.error(`ERROR: Location registration.js, INSERT INTO user_information...`);
                                        console.log(`DEBUG: Rolling Back Transaction...`);

                                        //we have failed, rollback the transaction
                                        connection.rollbackTransaction((err) => {
                                            if(err) {
                                                console.error(`ERROR: A FATAL ERROR HAS OCCURED`);
                                                console.error(`${err.message}`);            
                                                if(global.DEBUG_FLAG) {
                                                    console.log(`DEBUG: Failed to rollback`);
                                                }
                                                reject("An unknown error has occured. Contact an administrator for help");
                                            } else {
                                                //Not really sure why this would fail...
                                                if(global.DEBUG_FLAG) {
                                                    console.log(`DEBUG: Rolled back successfully`);
                                                }
                                                reject("An unknown error has occured. Contact an administrator for help");
                                            }
                                        });
                                    } else {
                                        if(global.DEBUG_FLAG) {
                                            console.log(`DEBUG: User Information has been inserted ${this.profile.username} -> ${this.profile.userID}`);
                                        }
                                        //we can now commit the transaction to the database
                                        connection.commitTransaction((err) => {
                                            if(err) {
                                                console.error(`ERROR: A FATAL ERROR HAS OCCURED`);
                                                console.error(`${err.message}`);            
                                                if(global.DEBUG_FLAG) {
                                                    console.log("DEBUG: Failed to Commit Transaction. Rolling back...");
                                                }
                                                reject("An unknown error has occured. Contact an administrator for help");
                                            } else {
                                                if(global.DEBUG_FLAG) {
                                                    console.log("DEBUG: Commited Transaction");
                                                }
                                                resolve("User account created successfully.");
                                            }

                                        });

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
                        
                        if(global.DEBUG_FLAG) {
                            console.log(`DEBUG: USER ID has been generated for ${this.profile.username} -> ${this.userID}`);
                        }
                });
        
                connection.execSql(request1);

            });
        });
    }
}
module.exports = Registration;
