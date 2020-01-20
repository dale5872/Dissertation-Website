const Connector = require('../connections/databaseConnector.js');
const { Request } = require('tedious');
const UserProfile = require('../auth/userProfile.js');

class UserInformation {
    constructor(userID) {
        this._userID = userID;
    }

    async retrieve() {
        var connector = new Connector();
        
        let connection = await connector.connect().catch((e) => {
            throw new Error("MySQL Connection Error");
        });

        let profile = await this.getUserInformation(connection).catch((e) => {
            throw new Error(e.message);
        });

        return profile;
    }

    async getUserInformation(connection) {
        const obj = this;

        return new Promise((resolve, reject) => {
            if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                console.log(`DEBUG LEVEL 1: Retrieving User Information From Cookie`);
            }
            
            //create a new Request for our SQL Query
            var request = new Request(
                `SELECT a.username, i.firstName, i.lastName, i.email
                FROM (feedbackhub.user_accounts AS a
                     INNER JOIN feedbackhub.user_information AS i
                         ON a.user_ID = i.user_ID)
                WHERE a.user_ID = ${obj._userID};`,
                (err, rowCount) => {
                    if(err) {
                        console.error("ERROR: An SQL Error has occured");
                        console.error(err.message);
                        reject("An unknown error has occured. Contact an administrator for help");
                    } else {
                        if(rowCount !== 1) {
                            if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                                console.error(`DEBUG LEVEL 1: User ${obj.userID} was not retirieved. A Fatal Error has Occured :31`);
                            }
                            reject(`A Fatal Error has Occured! :31`);
                        }
                    }
                }
            );

            request.on('row', (columns) => {
                var userProfile = new UserProfile();
                userProfile.username = columns[0].value;
                userProfile.fname = columns[1].value;
                userProfile.lname = columns[2].value;
                userProfile.email = columns[3].value;
                        
                if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                    console.log(`DEBUG LEVEL 1: User profile has been fetched for ${obj._userID}`);
                }

                resolve(userProfile.generateProfile());
            });
        
            //execute our defined Request
            connection.execSql(request);
        });
    }
}

module.exports = UserInformation;