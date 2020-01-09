const Connector = require('../connections/databaseConnector.js');
const { Request } = require('tedious');

class Login {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    authenticate() {
        var obj = this; //we need to preserve the object 'this' keyword as this is lost within the promise

        //we need to wrap everything in a new promise, otherwise a result cannot be sent to the user
        return new Promise(function(funResolve, funReject) {
            var connector = new Connector();
            
            //connect to the database, then authenticate
            connector.connect().then((connection) => {
                return new Promise(function(resolve, reject) {
                    if(global.DEBUG_FLAG) {
                        console.log(`DEBUG: Promise accepted, now running query`);
                    }
                    
                    //create a new Request for our SQL Query
                    var request = new Request(
                        `SELECT user_ID FROM feedbackhub.user_accounts
                        WHERE username = '${obj.username}' AND
                        password = '${obj.password}'`,
                        (err, rowCount) => {
                            if(err) {
                                console.error("ERROR: An SQL Error has occured");
                                console.error(err.message);
                                reject(`An error has occured`);
                            } else {
                                if(rowCount == 1) {
                                    //Successful Login
                                    if(global.DEBUG_FLAG) {
                                        console.log(`DEBUG: User ${obj.username} has been authenticated`);
                                    }
                                    resolve(`User ${obj.username} has been authenticated`);
                                } else {
                                    if(global.DEBUG_FLAG) {
                                        console.error(`DEBUG: User ${obj.username} was not authenticated`);
                                    }
                                    reject(`User ${obj.username} has not been authenticated`);
                                }
                            }
                        }
                    );
                
                    //execute our defined Request
                    connection.execSql(request);            
        
                }).then((res) => {
                    //once our authenticate has been resolved, close connection
                    //and resolve wrapper promise
                    connection.close();
                    
                    if(global.DEBUG_FLAG) {
                        console.log("DEBUG: Database Connection Closed");
                    }
                    funResolve(res);
                }).catch((error) => {
                    //if out authentication has been rejected, then close and show error
                    //and reject wrapper promise
                    connection.close();
                    if(global.DEBUG_FLAG) {
                        console.log("DEBUG: Database Connection Closed");
                    }
                    funReject(error);
                });
            }).catch((error) => {
                //if our sql connection has been rejected, show error and reject
                //wrapper promise
                console.error(error);
                output = error;
                funReject(error);
            });
        });
    }
}

module.exports = Login;