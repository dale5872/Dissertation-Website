const { Request } = require('tedious');
const Connector = require('../connections/databaseConnector.js');

class Classification {
    constructor(entityID, classification) {
        this._entityID = entityID;
        this._classification = classification;
    }

    async updateClassification() {
        if(global.DEBUG_FLAG) {
            console.log("DEBUG: Updating classification");
        }

        var connector = new Connector();

        let connection = await connector.connect().catch((e) => {
            throw new Error("Failed to connect to the database");
        });
        
        return new Promise((resolve, reject) => {
            var request = new Request(`UPDATE feedbackhub.classifications
            SET classification = ${this._classification}, classification_changed = 1
            WHERE entity_ID = ${this._entityID};`, (err) => {
                if(err) {
                    //Error occured
                    console.error("ERROR: An SQL Error has occured");
                    console.error(err.message);
                    reject("An unknown error has occured. Contact an administrator for help");
                } else {
                    //Successful retrieval, load the data into a JSON Object and resolve
                    resolve();
                }
            });

            connection.execSql(request);
        });

    }
}

module.exports = Classification;