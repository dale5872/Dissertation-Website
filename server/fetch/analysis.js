const { Request } = require('tedious');
const Connector = require('../connections/databaseConnector.js');

class Analysis {
    constructor(importID) {
        this._importID = importID
    }

    async fetchFullAnalysis() {
        if(global.DEBUG_FLAG) {
            console.log("DEBUG: Fetching Full Analysis");
        }

        var connector = new Connector();

        let connection = await connector.connect().catch((e) => {
            throw new Error("Failed to connect to the database");
        });
        
        const obj = this;

        return new Promise((resolve, reject) => {
            var request = new Request(`SELECT e.entity_id, e.raw_data, c.classification, qh.header_name, c.classification_changed
            FROM ((((feedbackhub.entity AS e
                INNER JOIN feedbackhub.classifications AS C ON e.entity_ID = c.entity_ID)
                 INNER JOIN feedbackhub.response AS r ON e.response_ID = r.response_ID)
                    INNER JOIN feedbackhub.import AS i ON r.import_ID = i.import_ID)
                        INNER JOIN feedbackhub.questionnaire_headers AS qh ON e.questionnaire_header_ID = qh.header_ID)
            WHERE i.import_ID = ${obj._importID}`, (err, rowCount, rows) => {
                if(err) {
                    //Error occured
                    console.error("ERROR: An SQL Error has occured");
                    console.error(err.message);
                    reject("An unknown error has occured. Contact an administrator for help");
                } else {
                    //Successful retrieval, load the data into a JSON Object and resolve
                    if(rowCount > 0) {
                        var dataObject = {};
                        dataObject.imports = [];

                        rows.forEach(column => {
                            dataObject.imports.push(
                                {
                                    entity_id: column[0].value,
                                    rawData: column[1].value,
                                    classification: column[2].value,
                                    rowHeader: column[3].value,
                                    classification_changed: column[4].value
                                }
                            )
                        });
                        console.log(dataObject);
                        resolve(dataObject)
                    }
                }
            });

            connection.execSql(request);
        });

    }
}

module.exports = Analysis;