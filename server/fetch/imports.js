const { Request } = require('tedious');
const Connector = require('../connections/databaseConnector.js');

class Imports {
    constructor(userID) {
        this._userID = userID;
    }

    async fetch() {
        if(global.DEBUG_FLAG) {
            console.log("DEBUG: Fetching Imports");
        }
        var connector = new Connector();

        let connection = await connector.connect().catch((e) => {
            throw new Error("Failed to connect to the database");
        });
        
        const obj = this;

        return new Promise((resolve, reject) => {
            if(global.DEBUG_FLAG) {
                console.log("DEBUG: Fetching Imports from Database");
            }

            var request = new Request(`SELECT i.import_Date, i.import_method, i.status, i.filename, i.responses, i.import_ID
            FROM feedbackhub.import AS i
            WHERE i.user_ID = ${obj._userID}`, (err, rowCount, rows) => {
                if(err) {
                    console.error("ERROR: An SQL Error has occured");
                    console.error(err.message);
                    reject("An unknown error has occured. Contact an administrator for help");
                } else {
                    if(rowCount > 0) {
                        var dataObject = {};
                        console.log(rows);
                        console.log(rowCount);
                        
                        dataObject.imports = [];

                        rows.forEach(column => {
                            dataObject.imports.push(
                                {
                                    importDate: column[0].value,
                                    importMethod: column[1].value,
                                    status: column[2].value,
                                    filename: column[3].value,
                                    responses: column[4].value,
                                    importID: column[5].value
                                }
                            )
                        });

                        if(global.DEBUG_FLAG) {
                            console.log(dataObject.imports);
                        }
            
                        resolve(dataObject);
                    } else {
                        if(global.DEBUG_FLAG) {
                            console.log(`DEBUG: No imports to retrieve`);
                        }
                        reject("No imports to retrieve");
    
                    }
                }
            });

            connection.execSql(request);
        });
    }
}

module.exports = Imports;
