const { Request } = require('tedious');
const Connector = require('../connections/databaseConnector.js');

class Analysis {
    constructor() {
    }

    static async fetchFullAnalysis(importID) {
        if(global.DEBUG_FLAG) {
            console.log("DEBUG: Fetching Full Analysis");
        }

        var connector = new Connector();

        let connection = await connector.connect().catch((e) => {
            throw new Error("Failed to connect to the database");
        });
        
        return new Promise((resolve, reject) => {
            var request = new Request(`SELECT e.entity_id, e.raw_data, c.classification, qh.header_name, c.classification_changed
            FROM ((((feedbackhub.entity AS e
                INNER JOIN feedbackhub.classifications AS C ON e.entity_ID = c.entity_ID)
                 INNER JOIN feedbackhub.response AS r ON e.response_ID = r.response_ID)
                    INNER JOIN feedbackhub.import AS i ON r.import_ID = i.import_ID)
                        INNER JOIN feedbackhub.questionnaire_headers AS qh ON e.questionnaire_header_ID = qh.header_ID)
            WHERE i.import_ID = ${importID}`, (err, rowCount, rows) => {
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

    static async fetchSimilarities(importID) {
        if(global.DEBUG_FLAG) {
            console.log("DEBUG: Fetching Similarity Analysis");
        }

        var connector = new Connector();

        let connection = await connector.connect().catch((e) => {
            throw new Error("Failed to connect to the database");
        });
        
        return new Promise((resolve, reject) => {
            var request = new Request(`SELECT CAST(e.raw_data AS NVARCHAR(100)), s.similarities AS 'Similarities', i.import_ID, q.header_name
            FROM ((((feedbackhub.entity AS e
                INNER JOIN feedbackhub.similarities AS s ON s.entityID = e.entity_ID)
                    INNER JOIN feedbackhub.questionnaire_headers AS q ON q.header_ID = e.questionnaire_header_ID)
                        INNER JOIN feedbackhub.response AS r ON e.response_ID = r.response_ID)
                            INNER JOIN feedbackhub.import AS i ON r.import_ID = i.import_ID)
            WHERE i.import_ID = ${importID} AND
                  s.similarities > 1
            ORDER BY s.similarities DESC;`, (err, rowCount, rows) => {
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
                                    rawData: column[0].value,
                                    similarities: column[1].value,
                                    importID: column[2].value,
                                    headerName: column[3].value
                                }
                            )
                        });
                        console.log(dataObject);
                        resolve(dataObject)
                    } else {
                        resolve(undefined);
                    }
                }
            });

            connection.execSql(request);
        });

    }

    static async fetchSentiment(importID) {
        if(global.DEBUG_FLAG) {
            console.log("DEBUG: Fetching Similarity Analysis");
        }

        var connector = new Connector();

        let connection = await connector.connect().catch((e) => {
            throw new Error("Failed to connect to the database");
        });
        
        return new Promise((resolve, reject) => {
            var request = new Request(`SELECT
            SUM(IIF(a.sentiment_compound > 0, 1, 0)) AS 'Positive',
            SUM(IIF(a.sentiment_compound = 0, 1, 0)) AS 'Neutral',
            SUM(IIF(a.sentiment_compound < 0, 1, 0)) AS 'Negative',
            SUM(a.sentiment_compound) AS 'Overall'
        FROM ((((feedbackhub.analysis AS a
            INNER JOIN feedbackhub.classifications AS c ON a.entity_ID = c.entity_ID)
                INNER JOIN feedbackhub.entity AS e ON e.entity_ID = a.entity_ID)
                    INNER JOIN feedbackhub.response AS r ON r.response_ID = e.response_ID)
                        INNER JOIN feedbackhub.import AS i ON r.import_ID = i.import_ID)
        WHERE i.import_ID = ${importID};`, (err, rowCount, rows) => {
                if(err) {
                    //Error occured
                    console.error("ERROR: An SQL Error has occured");
                    console.error(err.message);
                    reject("An unknown error has occured. Contact an administrator for help");
                } else {
                    //Successful retrieval, load the data into a JSON Object and resolve
                    if(rowCount > 0) {
                        var dataObject = {
                            positive: rows[0][0].value,
                            neutral: rows[0][1].value,
                            negative: rows[0][2].value,
                            overall: rows[0][3].value
                        };

                        resolve(dataObject)
                    } else {
                        resolve(undefined);
                    }
                }
            });

            connection.execSql(request);
        });

    }
}

module.exports = Analysis;