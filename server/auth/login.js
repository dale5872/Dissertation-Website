const Connector = require('../connections/databaseConnector.js');
const { Request } = require('tedious');

class Login {
    constructor(profile) {
        this._profile = profile;
    }

    async authenticate() {
        var connector = new Connector();
        var error = false;
        //if throwing error in the catch block, NodeJS Complains
        //could possibly be solved in a try / catch block

        let connection = await connector.connect().catch((e) => {
            error = true;
        });

        if(error) {
            throw new Error("SQL ERROR");
        }

        let outputMessage = await this.authenticateUser(connection).catch((e) => {
            error = true;
        });

        if(error) {
            throw new Error("Authentication Failed");
        }

        if(global.DEBUG_FLAG) {
            console.log(`DEBUG: Closing Database Connection`);
        }
        connection.close();
        return outputMessage;
    }

    async authenticateUser(connection) {
        const obj = this;
        return new Promise(function(resolve, reject) {
            if(global.DEBUG_FLAG) {
                console.log(`DEBUG: Login Promise accepted, now authenticating`);
            }
            
            //create a new Request for our SQL Query
            var request = new Request(
                `SELECT a.user_ID, i.firstName, i.lastName, i.email
                FROM (feedbackhub.user_accounts AS a
                     INNER JOIN feedbackhub.user_information AS i
                         ON a.user_ID = i.user_ID)
                WHERE a.username = '${obj._profile.username}' AND a.password = '${obj._profile.password}';`,
                (err, rowCount) => {
                    if(err) {
                        console.error("ERROR: An SQL Error has occured");
                        console.error(err.message);
                        reject("An unknown error has occured. Contact an administrator for help");
                    } else {
                        if(rowCount !== 1) {
                            if(global.DEBUG_FLAG) {
                                console.error(`DEBUG: User ${obj.username} was not authenticated`);
                            }
                            reject(`Login failed! The username and password combination is incorrect!`);
                        }
                    }
                }
            );

            request.on('row', (columns) => {
                obj._profile.userID = columns[0].value;
                obj._profile.fname = columns[1].value;
                obj._profile.lname = columns[2].value;
                obj._profile.email = columns[3].value;
                        
                if(global.DEBUG_FLAG) {
                    console.log(`DEBUG: USER ID has been fetched for ${obj._profile.username} -> ${obj._profile.userID}`);
                }

                resolve();
            });
        
            //execute our defined Request
            connection.execSql(request);
        });
    }
}

module.exports = Login;