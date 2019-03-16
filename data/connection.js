// Micahel Macari
// Module for mongodb connection

const MongoClient = require("mongodb").MongoClient

// Creates the settings for the Mongo Database
const settings = {
    mongoConfig: {
        serverUrl: "mongodb://localhost:27017/",
        database: "Michael_Macari_lab7"
    }
}

let _connection = undefined
let _db = undefined

// Exports the function that obtains the connection and creates the data base with the above settings
module.exports = async () => {
    if(!_connection){
        _connection = await MongoClient.connect(settings.mongoConfig.serverUrl, { useNewUrlParser: true })
        _db = await _connection.db(settings.mongoConfig.database)
    }
    // Return an instance of the database
    return(_db)
}