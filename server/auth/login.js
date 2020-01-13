const Connector = require('../connections/databaseConnector.js');
const { Request } = require('tedious');

class Login {
    constructor(profile) {
        this._profile = profile;
    }

    async authenticate() {
        var connector = new Connector();
        var outputMessage;

        let connection = await connector.connect().catch((error) => {
            throw new Error(`Failed to connect to the database. ${error}`);
        });

        outputMessage = await this.authenticateUser(connection).catch((error) => {
            throw new Error(error);
        });

        if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
            console.log(`DEBUG LEVEL 1: Closing Database Connection`);
        }
        connection.close();
    }

    async authenticateUser(connection) {
        const obj = this;
        return new Promise(function(resolve, reject) {
            if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                console.log(`DEBUG LEVEL 1: Login Promise accepted, now authenticating`);
            }
            
            //create a new Request for our SQL Query
            var request = new Request(
                `SELECT user_ID FROM feedbackhub.user_accounts
                WHERE username = '${obj._profile.username}' AND
                password = '${obj._profile.password}'`,
                (err, rowCount) => {
                    if(err) {
                        console.error("ERROR: An SQL Error has occured");
                        console.error(err.message);
                        reject("An unknown error has occured. Contact an administrator for help");
                    } else {
                        if(rowCount !== 1) {
                            if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                                console.error(`DEBUG LEVEL 1: User ${obj.username} was not authenticated`);
                            }
                            reject(`Login failed! The username and password combination is incorrect!`);
                        }
                    }
                }
            );

            request.on('row', (columns) => {
                obj._profile.userID = columns[0].value;
                        
                if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                    console.log(`DEBUG LEVEL 1: USER ID has been fetched for ${obj._profile.username} -> ${obj._profile.userID}`);
                }

                resolve();
            });
        
            //execute our defined Request
            connection.execSql(request);
        })
    }
}

module.exports = Login;