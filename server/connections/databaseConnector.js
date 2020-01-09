const { Connection } = require('tedious');

class Connector {
    constructor() {
    }

    connect() {
        //create a new promise for our SQL connection, as we must wait until
        //the connection is established before running queries
        return new Promise(function(resolve, reject) {
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

            if(global.DEBUG_FLAG) {
                console.log("DEBUG: Created Connection Config");
            }

            connection.on("connect", function(err) {
                if(err) {
                    console.log("ERROR: Failed to connect to Database");
                    console.error(err.message);
                    reject("Failed to connect to Database");
                } else {
                    if(global.DEBUG_FLAG) {
                        console.log("DEBUG: Connected to Database");
                    }
                    resolve(connection);        
                }               
            });  

        });
    }
}

module.exports = Connector;