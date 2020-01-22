const { Request } = require('tedious');
const Connector = require('../connections/databaseConnector.js');

class Responses {
    constructor(importID) {
        this._importID = importID;
    }

    async fetch() {
        //Initialise database connection
        var connector = new Connector();

        let connection = await connector.connect().catch((e) => {
            throw new Error("Failed to connect to the database");
        });
        
        const obj = this;

        return new Promise((resolve, reject) => {
            if(global.DEBUG_FLAG) {
                console.log("DEBUG: Fetching Responses from Database");
            }

            var request = new Request(`SELECT r.response_ID, e.raw_data
            FROM (feedbackhub.entity AS e
                 INNER JOIN feedbackhub.response AS r ON e.response_ID = r.response_ID
                     INNER JOIN feedbackhub.import AS i ON r.import_ID = i.import_ID)
            WHERE i.import_ID = ${obj._importID};`, (err, rowCount, rows) => {
                if(err) {
                    console.error("ERROR: An SQL Error has occured");
                    console.error(err.message);
                    reject("An unknown error has occured. Contact an administrator for help");
                } else {
                    if(rowCount > 0) {
                        var dataObject = {};
                        console.log(rows);
                        console.log(rowCount);
                        
                        dataObject.responses = [];

                        //create the output object with the expected fields
                        rows.forEach(column => {
                            dataObject.responses.push(
                                {
                                    responseID: column[0].value,
                                    raw_data: column[1].value
                                }
                            )
                        });

                        console.log(dataObject);
                        resolve(dataObject);
                    } else {
                        if(global.DEBUG_FLAG) {
                            console.log(`DEBUG: No responses to retrieve`);
                        }
                        reject("No responses to retrieve");
    
                    }
                }
            });

            connection.execSql(request);


        });
    }
}

module.exports = Responses;