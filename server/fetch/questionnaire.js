const { Request } = require('tedious');
const Connector = require('../connections/databaseConnector.js');
var TYPES = require('tedious').TYPES

class Questionnaire {
    constructor() {
    }

    async fetch(questionnaireID) {
        //Initialise database connection
        var connector = new Connector();

        let connection = await connector.connect().catch((e) => {
            throw new Error("Failed to connect to the database");
        });
        
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
            WHERE q.questionnaire_ID = ${questionnaireID}`, (err, rowCount, rows) => {
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
                        resolve(dataObject);
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
            WHERE q.questionnaire_ID = ${questionnaireID};`, (err, rowCount, rows) => {
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

    static async getAll(userID) {
        //Initialise database connection
        var connector = new Connector();

        let connection = await connector.connect().catch((e) => {
            throw new Error("Failed to connect to the database");
        });
        
        return new Promise((resolve, reject) => {
            if(global.DEBUG_FLAG) {
                console.log("DEBUG: Fetching Questionnaire informatiom from Database");
            }
            
            var dataObject = {
                questionnaireName: '',
                headers: []
            };

            //get the questionnaire data
            var request = new Request(`SELECT q.questionnaire_ID, q.questionnaire_name
            FROM (feedbackhub.questionnaire AS q
                INNER JOIN feedbackhub.user_accounts AS u ON u.user_ID = q.user_ID)
            WHERE u.user_ID = ${userID};`, (err, rowCount, rows) => {
                if(err) {
                    console.error("ERROR: An SQL Error has occured");
                    console.error(err.message);
                    reject("An unknown error has occured. Contact an administrator for help");
                } else {
                    if(rowCount > 0) {
                        var dataObject = {};                        
                        dataObject.imports = [];

                        rows.forEach(column => {
                            dataObject.imports.push(
                                {
                                    questionnaireID: column[0].value,
                                    questionnaireName: column[1].value
                                }
                            )
                        });

                        //we have all the information, resolve promise
                        resolve(dataObject);
                    } else {
                        if(global.DEBUG_FLAG) {
                            console.log(`DEBUG: No questionnaires to retrieve`);
                        }
                        reject("No questionnaires to retrieve");
                    }
                }
            });

            connection.execSql(request);
        });        
    }

    static async import(questionnaireData, userID, new_flag) {
        //Initialise database connection
        var connector = new Connector();

        let connection = await connector.connect().catch((e) => {
            throw new Error("Failed to connect to the database");
        });
        
        return new Promise((resolve, reject) => {
            //Create new questionnaire

            //begin transaction
            connection.beginTransaction((begin_T_err) => {
                if(begin_T_err) {
                    console.error("ERROR: An SQL Error has occured. questionnaire.js:98");
                    console.error(begin_T_err);
                    reject("An unknown error has occured. Contact an administrator for help");

                } else {

                    //insert questionnaire request
                    var insert_questionnaire_request = new Request(`INSERT INTO feedbackhub.questionnaire \
                     (questionnaire_name, user_ID, answerable) \
                      VALUES ('${questionnaireData.questionnaireName}', ${userID}, ${new_flag ? 1 : 0});`, (insert_QR_err, rowCount, rows) => {
                        if(insert_QR_err) {
                            console.error("ERROR: An SQL Error has occured. questionnaire.js:106");
                            console.error(insert_QR_err);
                            connection.rollbackTransaction((rollback_T_err) => {
                                if(rollback_T_err) {
                                    console.log(rollback_T_err);
                                }
                                reject();
                            });
                            reject("An unknown error has occured. Contact an administrator for help");
                        } else {                            
                            //we need to get the last insert id
                            var get_questionnaire_id = new Request(`SELECT CAST(@@IDENTITY AS INT)`, (sel_QID_err, rowCount, rows) => {
                                if(sel_QID_err){
                                    console.error("ERROR: An SQL Error has occured. questionnaire.js:121");
                                    console.error(insert_QR_err);
                                    connection.rollbackTransaction((rollback_T_err) => {
                                        if(rollback_T_err) {
                                            console.log(rollback_T_err);
                                        }
                                        reject();
                                    });
                                    reject("An unknown error has occured. Contact an administrator for help");         
                                } else {
                                    //grab the questionnaire id
                                    var questionnaireID = rows[0][0];

                                    //now insert entities
                                    //for each header, insert into the database
                                    //we're going to use a BulkLoad here
                                    
                                    var bulkLoad = connection.newBulkLoad('feedbackhub.questionnaire_headers', {keepNulls: true}, (blk_err, rowCount) => {
                                        if(blk_err) {
                                            console.error("ERROR: An SQL Error has occured. questionnaire.js:141");
                                            console.error(blk_err);
                                            connection.rollbackTransaction((rollback_T_err) => {
                                                if(rollback_T_err) {
                                                    console.log(rollback_T_err);
                                                }
                                                reject();
                                            });
                                            reject("An unknown error has occured. Contact an administrator for help");
                                        } else {
                                            if(global.DEBUG_FLAG) {
                                                console.log(`DEBUG: Inserted ${rowCount} headers`);
                                            }
                                            
                                            //finally, we need to add to the import IFF it is a new questionnaire
                                            if(new_flag) {
                                                var request_new_import = new Request(`INSERT INTO feedbackhub.import \
                                                (import_method, user_ID, status, filename, responses, questionnaire_ID) \
                                                VALUES ('questionnaire', ${userID}, 'Open', '${questionnaireData.questionnaireName}', 0, ${questionnaireID.value})`, (err) => {
                                                    if(err) {
                                                        console.error("ERROR: An SQL Error has occured. questionnaire.js:218");
                                                        console.error(err);
                                                        connection.rollbackTransaction((rollback_T_err) => {
                                                            if(rollback_T_err) {
                                                                console.log(rollback_T_err);
                                                            }
                                                            reject();
                                                        });
                                                    } else {
                                                        //we can commit the transaction
                                                        connection.commitTransaction((end_T_err) => {
                                                            if(end_T_err) {
                                                                console.error("ERROR: An SQL Error has occured. questionnaire.js:162");
                                                                console.error(end_T_err);
                                                                reject("An unknown error has occured. Contact an administrator for help");
                                                            } else {
                                                                //we have succeeded
                                                                resolve(questionnaireID);
                                                            }
                                                        });
                                                    }
                                                });

                                                connection.execSql(request_new_import);
                                            } else {
                                                //commit transaction
                                                connection.commitTransaction((end_T_err) => {
                                                    if(end_T_err) {
                                                        console.error("ERROR: An SQL Error has occured. questionnaire.js:162");
                                                        console.error(end_T_err);
                                                        reject("An unknown error has occured. Contact an administrator for help");
                                                    } else {
                                                        //we have succeeded
                                                        resolve(questionnaireID);
                                                    }
                                                });
                                            }
                                        }
                                    });

                                    bulkLoad.addColumn('header_name', TYPES.VarChar, {nullable: false});
                                    bulkLoad.addColumn('questionnaire_ID', TYPES.Int, {nullable: false});

                                    questionnaireData.questionnaireHeaders.forEach((header) => {
                                        bulkLoad.addRow({ header_ID: null, header_name: header, questionnaire_ID: questionnaireID.value});
                                        console.log(`QUESIONNAIRE ID: ${questionnaireID.value}`);
                                    });                                    
                                    
                                    connection.execBulkLoad(bulkLoad);
                                }
                            });
                            //fetch insert id
                            connection.execSql(get_questionnaire_id);

                        }
                    });
                }
    
                connection.execSql(insert_questionnaire_request);
            });
        });
    }

    static async verify(questionnaireID) {
        //Initialise database connection
        var connector = new Connector();

        let connection = await connector.connect().catch((e) => {
            throw new Error("Failed to connect to the database");
        });
        
        return new Promise((resolve, reject) => {
            if(global.DEBUG_FLAG) {
                console.log(`DEBUG: Verifying a questionnaire is able to be answered. Questionnaire ID: ${questionnaireID}`);
            }

            //get the questionnaire data
            var request = new Request(`SELECT q.questionnaire_name, u.firstName, u.lastName, i.import_ID, u.user_ID
            FROM ((feedbackhub.questionnaire AS q
                INNER JOIN feedbackhub.user_information AS u ON u.user_ID = q.user_ID)
                    INNER JOIN feedbackhub.import AS i ON i.questionnaire_ID = q.questionnaire_ID)
            WHERE q.questionnaire_ID = ${questionnaireID} AND \
            q.answerable = 1`, (err, rowCount, rows) => {
                if(err) {
                    console.error("ERROR: An SQL Error has occured");
                    console.error(err.message);
                    reject("An unknown error has occured. Contact an administrator for help");
                } else {
                    if(rowCount === 1) {
                        var dataObject = {
                            questionnaireName: rows[0][0].value,
                            writtenBy: rows[0][1].value + " " + rows[0][2].value,
                            importID: rows[0][3].value,
                            writerID: rows[0][4].value
                        };
                        //return the single result
                        resolve(dataObject);
                    } else {
                        //as it either doesn't exist, or an external error has occured, it is invalid (i.e., 0)
                        reject();
                    }
                }
            });

            connection.execSql(request);
        });
    }

    static async fetchQuestions(questionnaireID) {
        //Initialise database connection
        var connector = new Connector();

        let connection = await connector.connect().catch((e) => {
            throw new Error("Failed to connect to the database");
        });
        
        return new Promise((resolve, reject) => {
            if(global.DEBUG_FLAG) {
                console.log(`DEBUG: Verifying a questionnaire is able to be answered. Questionnaire ID: ${questionnaireID}`);
            }

            //get the questionnaire data
            var request = new Request(`SELECT q.header_name
            FROM feedbackhub.questionnaire_headers AS q
            WHERE q.questionnaire_ID = ${questionnaireID}`, (err, rowCount, rows) => {
                if(err) {
                    console.error("ERROR: An SQL Error has occured");
                    console.error(err.message);
                    reject("An unknown error has occured. Contact an administrator for help");
                } else {
                    if(rowCount > 0) {
                        var dataObject = {
                            headers: []
                        };

                        rows.forEach(column => {
                            dataObject.headers.push(column[0]);
                        });

                        //return the results
                        resolve(dataObject);
                    } else {
                        //as it either doesn't exist, or an external error has occured, it is invalid (i.e., 0)
                        reject();
                    }
                }
            });

            connection.execSql(request);
        });        
    }
}

module.exports = Questionnaire;