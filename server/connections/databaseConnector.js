const { Connection } = require('tedious');

class Connector {
    constructor() {
    }

    async connect() {
        return new Promise((resolve, reject) => {
            //create a new promise for our SQL connection, as we must wait until
            //the connection is established before running queries
            const config = {
                authentication: {
                    options: {
                        userName: "dale",
                        password: "EdenHazard10"
                    },
                    type: "default"
                },
                server: "feedback-hub.database.windows.net",
                options: {
                    database: "FeedbackHub",
                    encrypt: true
                }
            };
            
            var connection = new Connection(config);

            if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                console.log("DEBUG LEVEL 1: Connecting to Database...");
            }

            connection.on("connect", function(err) {
                if(err) {
                    console.log("ERROR: Failed to connect to Database");
                    console.error(err.message);
                    reject();
                } else {
                    if(global.DEBUG_FLAG && global.DEBUG_LEVEL == 1) {
                        console.log("DEBUG LEVEL 1: Connected to Database");
                    }
                    resolve(connection);
                }               
            });  
        });
    }
}

module.exports = Connector;