const { Connection } = require('tedious');

class Connector {
    constructor() {
    }

    getConfig() {
        const config = {
            authentication: {
                options: {
                    userName: "dale",
                    password: "[REDACTED]"
                },
                type: "default"
            },
            server: "feedback-hub.database.windows.net",
            options: {
                database: "FeedbackHub",
                encrypt: true
            }
        };
        return config;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            //create a new promise for our SQL connection, as we must wait until
            //the connection is established before running queries
            var connection = new Connection(this.getConfig());

            if(global.DEBUG_FLAG) {
                console.log("DEBUG: Connecting to Database...");
            }

            connection.on("connect", function(err) {
                if(err) {
                    console.log("ERROR: Failed to connect to Database");
                    console.error(err.message);
                    reject();
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
