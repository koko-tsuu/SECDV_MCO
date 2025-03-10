import {MongoClient} from 'mongodb';

const mongoURI = "mongodb://localhost:27017";
const client = new MongoClient(mongoURI);

export function connectToMOngo(callback){
    client.connect().then( (client) => {
        return callback();
    }).catch( err =>{
        callback(err);
    })
}

export function getDb(dbName = "posts") {
    return client.db(dbName);
}

function signalHandler(){
    console.log*("Closing MongoDB connection...");
    client.close();
    process.exit();
}

