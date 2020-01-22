const { Request } = require('tedious');
const Connector = require('../connections/databaseConnector.js');

class Questionnaire {
    constructor(questionnaireID) {
        this._questionnaireID = questionnaireID;
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
                console.log("DEBUG: Fetching Questionnaire informatiom from Database");
            }
            
            var dataObject = {
                questionnaireName: '',
                headers: []
            };

            //get the questionnaire data
            var request_name = new Request(`SELECT q.questionnaire_name
            FROM feedbackhub.questionnaire AS Q
            WHERE q.questionnaire_ID = ${obj._questionnaireID}`, (err, rowCount, rows) => {
                if(err) {
                    console.error("ERROR: An SQL Error has occured");
                    console.error(err.message);
                    reject("An unknown error has occured. Contact an administrator for help");
                } else {
                    if(rowCount > 0) {
                        rows.forEach(column => {
                            dataObject.questionnaireName = column[0];
                        });

                        //we have all the information, resolve promise
                        resolve(dataObject)
                    } else {
                        if(global.DEBUG_FLAG) {
                            console.log(`DEBUG: No responses to retrieve`);
                        }
                        reject("No questionnaires to retrieve");
                    }
                }
            });

            //get the questionnaires headers
            var request_headers = new Request(`SELECT qh.header_name
            FROM (feedbackhub.questionnaire_headers AS qh
                INNER JOIN feedbackhub.questionnaire AS q ON qh.questionnaire_ID = q.questionnaire_ID)
            WHERE q.questionnaire_ID = ${obj._questionnaireID};`, (err, rowCount, rows) => {
                if(err) {
                    console.error("ERROR: An SQL Error has occured");
                    console.error(err.message);
                    reject("An unknown error has occured. Contact an administrator for help");
                } else {
                    if(rowCount > 0) {
                        dataObject.responses = [];

                        //create the output object with the expected fields
                        rows.forEach(column => {
                            dataObject.headers.push(column[0].value)
                        });

                        //get the questionnaire data
                        connection.execSql(request_name);

                    } else {
                        if(global.DEBUG_FLAG) {
                            console.log(`DEBUG: No responses to retrieve`);
                        }
                        reject("No responses to retrieve");
                    }
                }
            });

            connection.execSql(request_headers);
        });
        
    }

}

module.exports = Questionnaire;